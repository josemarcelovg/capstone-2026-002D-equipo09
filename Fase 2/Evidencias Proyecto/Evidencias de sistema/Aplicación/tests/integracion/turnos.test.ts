import assert from "node:assert/strict";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client.ts";
import { fechaDesdeBase, fechaParaBase, sumarDias } from "../../src/lib/fechas.ts";
import {
  mensajeConductorInactivo,
  mensajeConductorOcupado,
  mensajeVehiculoNoActivo,
  mensajeVehiculoOcupado,
  validarTurno,
} from "../../src/lib/turnos.ts";
import {
  actualizarTurno,
  anularTurno,
  contarTurnosDesdeHoy,
  crearTurno,
  NoEncontradoError,
  obtenerTurno,
  opcionesDeTurno,
  turnosDelDia,
  turnosDesdeHoy,
  TurnoNoModificableError,
  TurnoNoValidoError,
  type ContextoTurnos,
} from "../../src/lib/turnos-datos.ts";

// Pruebas del acceso a datos de turnos (JOS-20) con la base de datos. Cada prueba trabaja en
// una transacción que se deshace al final, así que no dependen del seed.

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de integración)";

// Se usa una fecha fija como hoy para que las pruebas no dependan del día en que se corren.
const HOY = "2026-12-01";
const dia = (dias: number) => sumarDias(HOY, dias);

class Deshacer extends Error {}

// Corre la prueba en una transacción y la deshace al final.
async function sinGuardar(prueba: (tx: Tx) => Promise<void>) {
  try {
    await prisma.$transaction(
      async (tx) => {
        await prueba(tx);
        throw new Deshacer();
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
  } catch (error) {
    if (!(error instanceof Deshacer)) throw error;
  }
}

type EstadoVehiculo = "activo" | "en_mantencion" | "inactivo";

// Empresa con dos vehículos y dos conductores activos.
async function empresaConFlota(tx: Tx, nombre: string) {
  const empresa = await tx.empresa.create({
    data: { nombre: `${nombre} ${NOMBRE_DE_PRUEBA}`, emailContacto: "contacto@ejemplo.cl" },
    select: { id: true },
  });
  const vehiculo = (patente: string, estado: EstadoVehiculo = "activo") =>
    tx.vehiculo.create({
      data: {
        empresaId: empresa.id,
        patente,
        tipo: "van",
        marca: "Prueba",
        modelo: "Prueba",
        anio: 2020,
        capacidadPasajeros: 15,
        estado,
      },
      select: { id: true, patente: true },
    });
  const conductor = (nombre: string, rut: string, activo = true) =>
    tx.conductor.create({
      data: { empresaId: empresa.id, nombre, rut, telefono: "+56900000001", activo },
      select: { id: true, nombre: true },
    });

  return {
    contexto: { db: tx, empresaId: empresa.id, hoy: HOY } satisfies ContextoTurnos,
    bus: await vehiculo("BBCD12"),
    van: await vehiculo("FGHJ34"),
    pedro: await conductor("Pedro Soto", "11111111-1"),
    maria: await conductor("María Muñoz", "22222222-2"),
    vehiculo,
    conductor,
  };
}

// Valida con el mismo esquema que usa la app. Por defecto, en la mañana de mañana.
function datos(cambios: Record<string, unknown>) {
  const resultado = validarTurno({ fecha: dia(1), jornada: "manana", ...cambios }, HOY);
  assert.ok(resultado.ok, `Datos de prueba inválidos: ${JSON.stringify(resultado)}`);
  return resultado.datos;
}

// Turno guardado directo en la base, para tener turnos pasados o anulados.
function turnoDirecto(tx: Tx, empresaId: string, cambios: Omit<Prisma.TurnoUncheckedCreateInput, "empresaId" | "fecha"> & { fecha: string }) {
  return tx.turno.create({
    data: { ...cambios, empresaId, fecha: fechaParaBase(cambios.fecha) },
    select: { id: true },
  });
}

// Los mensajes por campo con que se rechazó el turno.
async function errores(guardar: Promise<unknown>) {
  try {
    await guardar;
  } catch (error) {
    if (error instanceof TurnoNoValidoError) return error.errores;
    throw error;
  }
  assert.fail("Se guardó un turno que se tenía que rechazar.");
}

describe("Acceso a datos de turnos", { skip: sinBase }, () => {
  test("PB-17 · crear guarda el turno, y la vista del día lo muestra por jornada con los anulados (JOA-14, criterios 1 y 5)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria } = await empresaConFlota(tx, "Empresa A");
      await crearTurno(contexto, datos({ jornada: "noche", vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ jornada: "manana", vehiculoId: van.id, conductorId: maria.id }));
      const tarde = await crearTurno(contexto, datos({ jornada: "tarde", vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ fecha: dia(2), vehiculoId: bus.id, conductorId: pedro.id }));
      await anularTurno(contexto, tarde.id, null);

      const delDia = await turnosDelDia(contexto, dia(1));
      assert.deepEqual(
        delDia.map((turno) => [turno.jornada, turno.vehiculo.patente, turno.conductor.nombre, turno.anulado]),
        [
          ["manana", "FGHJ34", "María Muñoz", false],
          ["tarde", "BBCD12", "Pedro Soto", true],
          ["noche", "BBCD12", "Pedro Soto", false],
        ],
      );
      assert.ok(delDia.every((turno) => turno.fecha === dia(1)));
      assert.deepEqual(await turnosDelDia(contexto, dia(3)), []);
      assert.deepEqual(await turnosDelDia(contexto, "2026-02-31"), []);
    });
  });

  test("PB-17 · solo se asignan vehículos y conductores activos, y no se guarda nada (JOA-14, criterio 2)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, pedro, vehiculo, conductor } = await empresaConFlota(tx, "Empresa A");
      const enTaller = await vehiculo("HJKL78", "en_mantencion");
      const vendido = await vehiculo("XY4321", "inactivo");
      const luis = await conductor("Luis Rojas", "33333333-3", false);

      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: enTaller.id, conductorId: pedro.id }))), {
        vehiculoId: mensajeVehiculoNoActivo("HJKL78"),
      });
      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: vendido.id, conductorId: luis.id }))), {
        vehiculoId: mensajeVehiculoNoActivo("XY4321"),
        conductorId: mensajeConductorInactivo("Luis Rojas"),
      });
      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: luis.id }))), {
        conductorId: "Luis Rojas está inactivo y no se puede asignar.",
      });
      assert.equal(await tx.turno.count({ where: { empresaId: contexto.empresaId } }), 0);
    });
  });

  test("PB-17 · un vehículo o conductor con turno en esa fecha y jornada se rechaza con su mensaje; en otra jornada, no (JOA-14, criterio 3)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria } = await empresaConFlota(tx, "Empresa A");
      await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }));

      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: maria.id }))), {
        vehiculoId: mensajeVehiculoOcupado("BBCD12", dia(1), "manana"),
      });
      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: van.id, conductorId: pedro.id }))), {
        conductorId: mensajeConductorOcupado("Pedro Soto", dia(1), "manana"),
      });
      assert.deepEqual(await errores(crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }))), {
        vehiculoId: "BBCD-12 ya tiene un turno el 02-12-2026 en la mañana.",
        conductorId: "Pedro Soto ya tiene un turno el 02-12-2026 en la mañana.",
      });

      await crearTurno(contexto, datos({ jornada: "tarde", vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ vehiculoId: van.id, conductorId: maria.id }));
      assert.equal(await tx.turno.count({ where: { empresaId: contexto.empresaId } }), 3);
    });
  });

  test("PB-18 · los filtros por vehículo y por conductor traen sus turnos desde hoy, ordenados y sin anulados por defecto (JOA-14, criterio 6)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria } = await empresaConFlota(tx, "Empresa A");
      const empresaId = contexto.empresaId;
      await turnoDirecto(tx, empresaId, { fecha: dia(-1), jornada: "manana", vehiculoId: bus.id, conductorId: pedro.id });
      await crearTurno(contexto, datos({ fecha: dia(3), vehiculoId: bus.id, conductorId: maria.id }));
      await crearTurno(contexto, datos({ jornada: "noche", vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ fecha: dia(0), jornada: "tarde", vehiculoId: van.id, conductorId: pedro.id }));
      const anulado = await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: maria.id }));
      await anularTurno(contexto, anulado.id, "Se cambió el recorrido.");

      const fechaYJornada = (turnos: { fecha: string; jornada: string }[]) =>
        turnos.map((turno) => `${turno.fecha} ${turno.jornada}`);
      assert.deepEqual(fechaYJornada(await turnosDesdeHoy(contexto, { vehiculoId: bus.id })), [
        `${dia(1)} noche`,
        `${dia(3)} manana`,
      ]);
      assert.deepEqual(fechaYJornada(await turnosDesdeHoy(contexto, { vehiculoId: bus.id, incluirAnulados: true })), [
        `${dia(1)} manana`,
        `${dia(1)} noche`,
        `${dia(3)} manana`,
      ]);
      assert.deepEqual(fechaYJornada(await turnosDesdeHoy(contexto, { conductorId: pedro.id })), [
        `${dia(0)} tarde`,
        `${dia(1)} noche`,
      ]);
      assert.deepEqual(await turnosDesdeHoy(contexto, { vehiculoId: "no-es-un-id" }), []);
    });
  });

  test("PB-19 · editar guarda los cambios con las mismas reglas, sin chocar consigo mismo, y puede mantener un vehículo que pasó a mantención (JOA-14, criterio 9)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria, conductor } = await empresaConFlota(tx, "Empresa A");
      const turno = await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ jornada: "tarde", vehiculoId: van.id, conductorId: maria.id }));

      const igual = await actualizarTurno(contexto, turno.id, datos({ vehiculoId: bus.id, conductorId: pedro.id }));
      assert.equal(igual?.jornada, "manana");

      assert.deepEqual(
        await errores(actualizarTurno(contexto, turno.id, datos({ jornada: "tarde", vehiculoId: van.id, conductorId: pedro.id }))),
        { vehiculoId: mensajeVehiculoOcupado("FGHJ34", dia(1), "tarde") },
      );

      await tx.vehiculo.update({ where: { id: bus.id }, data: { estado: "en_mantencion" } });
      await tx.conductor.update({ where: { id: pedro.id }, data: { activo: false } });
      const movido = await actualizarTurno(
        contexto,
        turno.id,
        datos({ fecha: dia(5), jornada: "noche", vehiculoId: bus.id, conductorId: pedro.id }),
      );
      assert.equal(movido?.fecha, dia(5));
      assert.equal(movido?.jornada, "noche");
      assert.equal(movido?.vehiculo.estado, "en_mantencion");
      assert.equal(movido?.conductor.activo, false);

      const luis = await conductor("Luis Rojas", "33333333-3", false);
      assert.deepEqual(
        await errores(actualizarTurno(contexto, turno.id, datos({ vehiculoId: bus.id, conductorId: luis.id }))),
        { conductorId: mensajeConductorInactivo("Luis Rojas") },
      );

      const guardado = await tx.turno.findUniqueOrThrow({ where: { id: turno.id } });
      assert.equal(fechaDesdeBase(guardado.fecha), dia(5));
      assert.equal(guardado.conductorId, pedro.id);
    });
  });

  test("PB-19 · un turno pasado o anulado no se edita ni se anula (JOA-14, criterio 9)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, pedro } = await empresaConFlota(tx, "Empresa A");
      const pasado = await turnoDirecto(tx, contexto.empresaId, {
        fecha: dia(-1),
        jornada: "noche",
        vehiculoId: bus.id,
        conductorId: pedro.id,
      });
      const anulado = await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }));
      await anularTurno(contexto, anulado.id, null);

      for (const { id } of [pasado, anulado]) {
        await assert.rejects(
          actualizarTurno(contexto, id, datos({ fecha: dia(2), vehiculoId: bus.id, conductorId: pedro.id })),
          TurnoNoModificableError,
        );
        await assert.rejects(anularTurno(contexto, id, "Otra vez"), TurnoNoModificableError);
      }
      const sinCambios = await tx.turno.findUniqueOrThrow({ where: { id: pasado.id } });
      assert.equal(fechaDesdeBase(sinCambios.fecha), dia(-1));
      assert.equal(sinCambios.anulado, false);

      const deHoy = await crearTurno(contexto, datos({ fecha: dia(0), vehiculoId: bus.id, conductorId: pedro.id }));
      assert.equal((await anularTurno(contexto, deHoy.id, null))?.anulado, true);
    });
  });

  test("PB-19 · anular guarda el motivo, deja el turno a la vista y libera el vehículo y el conductor (JOA-14, criterio 10)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria } = await empresaConFlota(tx, "Empresa A");
      const turno = await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }));

      const anulado = await anularTurno(contexto, turno.id, "Se cambió el recorrido.");
      assert.equal(anulado?.anulado, true);
      assert.equal(anulado?.motivoAnulacion, "Se cambió el recorrido.");
      assert.equal((await obtenerTurno(contexto, turno.id))?.anulado, true);

      await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: maria.id }));
      await crearTurno(contexto, datos({ vehiculoId: van.id, conductorId: pedro.id }));
      assert.equal((await turnosDelDia(contexto, dia(1))).length, 3);
    });
  });

  test("JOA-14, criterio 11 · cuenta los turnos desde hoy de un vehículo o conductor, y desactivarlo no los anula", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria } = await empresaConFlota(tx, "Empresa A");
      await turnoDirecto(tx, contexto.empresaId, { fecha: dia(-1), jornada: "manana", vehiculoId: bus.id, conductorId: pedro.id });
      await crearTurno(contexto, datos({ fecha: dia(0), vehiculoId: bus.id, conductorId: pedro.id }));
      await crearTurno(contexto, datos({ fecha: dia(2), vehiculoId: bus.id, conductorId: maria.id }));
      const anulado = await crearTurno(contexto, datos({ fecha: dia(3), vehiculoId: van.id, conductorId: pedro.id }));
      await anularTurno(contexto, anulado.id, null);

      assert.equal(await contarTurnosDesdeHoy(contexto, { vehiculoId: bus.id }), 2);
      assert.equal(await contarTurnosDesdeHoy(contexto, { conductorId: pedro.id }), 1);
      assert.equal(await contarTurnosDesdeHoy(contexto, { vehiculoId: van.id }), 0);

      await tx.vehiculo.update({ where: { id: bus.id }, data: { estado: "inactivo" } });
      await tx.conductor.update({ where: { id: pedro.id }, data: { activo: false } });
      assert.equal(await contarTurnosDesdeHoy(contexto, { vehiculoId: bus.id }), 2);
      assert.equal(await tx.turno.count({ where: { empresaId: contexto.empresaId, anulado: true } }), 1);
    });
  });

  test("PB-17 a PB-19 · con la empresa equivocada un turno no se ve, no se edita ni se anula, y no se usa un vehículo o conductor de otra (JOA-14, criterios 12 y 13)", async () => {
    await sinGuardar(async (tx) => {
      const a = await empresaConFlota(tx, "Empresa A");
      const b = await empresaConFlota(tx, "Empresa B");
      const deB = await crearTurno(b.contexto, datos({ vehiculoId: b.bus.id, conductorId: b.pedro.id }));
      await crearTurno(a.contexto, datos({ vehiculoId: a.bus.id, conductorId: a.pedro.id }));

      assert.equal(await obtenerTurno(a.contexto, deB.id), null);
      assert.equal(
        await actualizarTurno(a.contexto, deB.id, datos({ jornada: "tarde", vehiculoId: a.van.id, conductorId: a.maria.id })),
        null,
      );
      assert.equal(await anularTurno(a.contexto, deB.id, "Desde A"), null);
      assert.deepEqual(
        (await turnosDelDia(a.contexto, dia(1))).map((turno) => turno.vehiculo.id),
        [a.bus.id],
      );
      assert.deepEqual(await turnosDesdeHoy(a.contexto, { vehiculoId: b.bus.id }), []);
      assert.equal(await contarTurnosDesdeHoy(a.contexto, { conductorId: b.pedro.id }), 0);

      await assert.rejects(
        crearTurno(a.contexto, datos({ jornada: "tarde", vehiculoId: b.bus.id, conductorId: a.pedro.id })),
        NoEncontradoError,
      );
      await assert.rejects(
        crearTurno(a.contexto, datos({ jornada: "tarde", vehiculoId: a.bus.id, conductorId: b.pedro.id })),
        NoEncontradoError,
      );

      const sinCambios = await tx.turno.findUniqueOrThrow({ where: { id: deB.id } });
      assert.equal(sinCambios.jornada, "manana");
      assert.equal(sinCambios.anulado, false);
      assert.equal(sinCambios.empresaId, b.contexto.empresaId);
    });
  });

  test("el formulario ofrece solo vehículos y conductores activos, marca los que ya tienen turno y, al editar, incluye los del turno (JOA-14, sección 4)", async () => {
    await sinGuardar(async (tx) => {
      const { contexto, bus, van, pedro, maria, vehiculo, conductor } = await empresaConFlota(tx, "Empresa A");
      await vehiculo("HJKL78", "en_mantencion");
      await conductor("Luis Rojas", "33333333-3", false);
      const turno = await crearTurno(contexto, datos({ vehiculoId: bus.id, conductorId: pedro.id }));

      const nuevo = await opcionesDeTurno(contexto, { fecha: dia(1), jornada: "manana" });
      assert.deepEqual(
        nuevo.vehiculos.map((opcion) => [opcion.patente, opcion.activo, opcion.ocupado]),
        [
          ["BBCD12", true, true],
          ["FGHJ34", true, false],
        ],
      );
      assert.deepEqual(
        nuevo.conductores.map((opcion) => [opcion.nombre, opcion.activo, opcion.ocupado]),
        [
          ["María Muñoz", true, false],
          ["Pedro Soto", true, true],
        ],
      );

      await tx.vehiculo.update({ where: { id: bus.id }, data: { estado: "en_mantencion" } });
      const editar = await opcionesDeTurno(contexto, { fecha: dia(1), jornada: "manana", turnoId: turno.id });
      assert.deepEqual(
        editar.vehiculos.map((opcion) => [opcion.id, opcion.activo, opcion.ocupado]),
        [
          [bus.id, false, false],
          [van.id, true, false],
        ],
      );
      assert.deepEqual(
        editar.conductores.map((opcion) => opcion.id),
        [maria.id, pedro.id],
      );

      const sinFecha = await opcionesDeTurno(contexto);
      assert.ok([...sinFecha.vehiculos, ...sinFecha.conductores].every((opcion) => !opcion.ocupado));
    });
  });

  test("no quedan datos de estas pruebas en la base", async () => {
    const sobrantes = await prisma.empresa.count({
      where: { nombre: { endsWith: NOMBRE_DE_PRUEBA } },
    });
    assert.equal(sobrantes, 0);
  });
});
