import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client.ts";
import { validarConductor } from "../../src/lib/conductores.ts";
import { conductorDeLaEmpresa, filtroConductores } from "../../src/lib/conductores-filtros.ts";
import { calcularEstado, rangoDeFechas, validarDocumento } from "../../src/lib/documentos.ts";
import {
  documentoDeLaEmpresa,
  documentosDelDueno,
  filtroDocumentos,
  ORDEN_DOCUMENTOS,
  type FiltroDocumentos,
} from "../../src/lib/documentos-filtros.ts";
import { fechaDesdeBase, fechaParaBase, sumarDias } from "../../src/lib/fechas.ts";
import { formatearPatente, normalizarPatente, validarVehiculo } from "../../src/lib/vehiculos.ts";

// Pruebas de integración de la aplicación con la base de datos (SIM-04, CP-INT-01 a CP-INT-10,
// CP-INT-17 a CP-INT-20 para conductores, y las de PB-24 y de documentos).
// Usan el cliente Prisma generado y la base de DATABASE_URL, igual que la aplicación.
//
// No dejan datos: cada prueba crea sus propias empresas y vehículos dentro de una transacción
// que se deshace al final. Por eso no dependen del seed y se pueden ejecutar contra la base
// de desarrollo de Supabase o contra la de Docker (JOS-05).

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de integración)";

class Deshacer extends Error {}

/** Ejecuta la prueba dentro de una transacción y la deshace siempre, aunque todo salga bien. */
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

/** Una transacción que debe fallar con el código de Prisma indicado; al fallar se deshace sola. */
async function debeFallar(codigo: string, prueba: (tx: Tx) => Promise<void>) {
  await assert.rejects(
    prisma.$transaction(prueba, { maxWait: 10_000, timeout: 30_000 }),
    (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === codigo,
  );
}

async function crearEmpresa(tx: Tx, nombre: string) {
  const empresa = await tx.empresa.create({
    data: { nombre: `${nombre} ${NOMBRE_DE_PRUEBA}`, emailContacto: "contacto@ejemplo.cl" },
    select: { id: true },
  });
  return empresa.id;
}

/** Valida con el mismo esquema del formulario y del servidor (src/lib/vehiculos.ts). */
function validado(cambios: Record<string, unknown> = {}) {
  const resultado = validarVehiculo({
    patente: "FGHJ-34",
    tipo: "van",
    marca: "Mercedes-Benz",
    modelo: "Sprinter 515",
    anio: "2021",
    capacidadPasajeros: "19",
    ...cambios,
  });
  assert.ok(resultado.ok, `Datos de prueba inválidos: ${JSON.stringify(resultado)}`);
  return resultado.datos;
}

async function crearVehiculo(tx: Tx, empresaId: string, cambios: Record<string, unknown> = {}) {
  return tx.vehiculo.create({ data: { ...validado(cambios), empresaId } });
}

describe("Vehículos en la base de datos", { skip: sinBase }, () => {
  test("CP-INT-01 · guarda los datos tal como los normaliza la validación", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const creado = await crearVehiculo(tx, empresa, {
        patente: "bb-cd 12",
        marca: "  Mercedes-Benz  ",
        numeroInterno: "",
        color: "",
      });

      const guardado = await tx.vehiculo.findUniqueOrThrow({ where: { id: creado.id } });
      assert.equal(guardado.patente, "BBCD12");
      assert.equal(formatearPatente(guardado.patente), "BBCD-12");
      assert.equal(guardado.marca, "Mercedes-Benz");
      assert.equal(guardado.anio, 2021);
      assert.equal(guardado.capacidadPasajeros, 19);
      assert.equal(guardado.numeroInterno, null);
      assert.equal(guardado.color, null);
      assert.equal(guardado.estado, "activo");
      assert.equal(guardado.empresaId, empresa);
    });
  });

  test("CP-INT-02 · los valores límite que acepta el formulario caben en las columnas", async () => {
    const anioMaximo = new Date().getFullYear() + 1;
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const maximos = await crearVehiculo(tx, empresa, {
        patente: "AB1234",
        marca: "M".repeat(50),
        modelo: "N".repeat(50),
        anio: String(anioMaximo),
        capacidadPasajeros: "100",
        numeroInterno: "9".repeat(20),
        color: "C".repeat(30),
        observaciones: "O".repeat(500),
      });
      const minimos = await crearVehiculo(tx, empresa, {
        patente: "ZZZZ00",
        marca: "MB",
        modelo: "X",
        anio: "1980",
        capacidadPasajeros: "1",
      });

      assert.equal(maximos.observaciones?.length, 500);
      assert.equal(maximos.anio, anioMaximo);
      assert.equal(maximos.capacidadPasajeros, 100);
      assert.equal(minimos.anio, 1980);
      assert.equal(minimos.capacidadPasajeros, 1);
    });
  });

  test("CP-INT-03 · la base asigna el estado «activo» si no se indica", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const { estado, ...sinEstado } = validado();
      assert.equal(estado, "activo");
      const creado = await tx.vehiculo.create({ data: { ...sinEstado, empresaId: empresa } });
      assert.equal(creado.estado, "activo");
    });
  });

  test("CP-INT-04 · rechaza una patente repetida en la misma empresa, aunque esté inactiva", async () => {
    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      await crearVehiculo(tx, empresa, { patente: "BBCD12", estado: "inactivo" });
      await crearVehiculo(tx, empresa, { patente: "bb-cd-12" });
    });
  });

  test("CP-INT-05 · otra empresa puede registrar la misma patente", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      await crearVehiculo(tx, empresaA, { patente: "BBCD12" });
      await crearVehiculo(tx, empresaB, { patente: "BBCD12" });

      const conEsaPatente = await tx.vehiculo.count({
        where: { patente: "BBCD12", empresaId: { in: [empresaA, empresaB] } },
      });
      assert.equal(conEsaPatente, 2);
    });
  });

  test("CP-INT-06 · cambiar la patente al editar por una que ya tiene la empresa se rechaza", async () => {
    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      await crearVehiculo(tx, empresa, { patente: "BBCD12" });
      const otro = await crearVehiculo(tx, empresa, { patente: "FGHJ34" });
      // Misma condición que actualizarVehiculo() en src/lib/vehiculos-datos.ts.
      await tx.vehiculo.update({
        where: { id: otro.id, empresaId: empresa },
        data: { patente: validado({ patente: "bbcd 12" }).patente },
      });
    });
  });

  test("CP-INT-07 · el listado trae solo los vehículos de la empresa, ordenados y con sus filtros", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      await crearVehiculo(tx, empresaA, { patente: "KLPR56" });
      await crearVehiculo(tx, empresaA, { patente: "BBCD12", estado: "en_mantencion" });
      await crearVehiculo(tx, empresaA, { patente: "FGHJ34", estado: "inactivo" });
      await crearVehiculo(tx, empresaB, { patente: "AB1234" });

      // Misma consulta que listarVehiculos() en src/lib/vehiculos-datos.ts.
      const listar = async (patente = "", estado?: "en_mantencion", incluirInactivos = false) => {
        const vehiculos = await tx.vehiculo.findMany({
          where: {
            empresaId: empresaA,
            patente: { contains: normalizarPatente(patente) },
            estado: estado ?? (incluirInactivos ? undefined : { not: "inactivo" }),
          },
          select: { patente: true },
          orderBy: { patente: "asc" },
        });
        return vehiculos.map((vehiculo) => vehiculo.patente);
      };

      assert.deepEqual(await listar(), ["BBCD12", "KLPR56"]);
      assert.deepEqual(await listar("", undefined, true), ["BBCD12", "FGHJ34", "KLPR56"]);
      assert.deepEqual(await listar("kl-pr"), ["KLPR56"]);
      assert.deepEqual(await listar("", "en_mantencion"), ["BBCD12"]);
      assert.deepEqual(await listar("AB12"), []);
    });
  });
});

describe("Separación entre empresas en la base de datos", { skip: sinBase }, () => {
  test("CP-INT-08 · buscar o editar por id con la empresa equivocada no encuentra ni cambia nada", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearVehiculo(tx, empresaB, { patente: "AB1234", color: "Blanco" });

      // Mismas condiciones que obtenerVehiculo() y actualizarVehiculo(): id y empresa de la sesión.
      const encontrado = await tx.vehiculo.findFirst({ where: { id: deB.id, empresaId: empresaA } });
      assert.equal(encontrado, null);

      await assert.rejects(
        tx.vehiculo.update({ where: { id: deB.id, empresaId: empresaA }, data: { color: "Rojo" } }),
        (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025",
      );

      const sinCambios = await tx.vehiculo.findUniqueOrThrow({ where: { id: deB.id } });
      assert.equal(sinCambios.color, "Blanco");
      assert.equal(sinCambios.empresaId, empresaB);
    });
  });

  test("CP-INT-09 · un vehículo no se puede guardar en una empresa que no existe", async () => {
    await debeFallar("P2003", async (tx) => {
      await crearVehiculo(tx, randomUUID());
    });
  });
});

/** Valida con el mismo esquema del formulario y del servidor (src/lib/conductores.ts). */
async function crearConductor(tx: Tx, empresaId: string, cambios: Record<string, unknown> = {}) {
  const resultado = validarConductor({
    nombre: "Conductor de prueba",
    rut: "11.111.111-1",
    telefono: "9 0000 0001",
    ...cambios,
  });
  assert.ok(resultado.ok, `Datos de prueba inválidos: ${JSON.stringify(resultado)}`);
  return tx.conductor.create({ data: { ...resultado.datos, empresaId } });
}

describe("Conductores en la base de datos", { skip: sinBase }, () => {
  test("CP-INT-17 · guarda el conductor normalizado y activo por defecto", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const conductor = await crearConductor(tx, empresa, { nombre: "  Ana   Díaz ", email: "" });
      assert.equal(conductor.nombre, "Ana Díaz");
      assert.equal(conductor.rut, "11111111-1");
      assert.equal(conductor.telefono, "+56900000001");
      assert.equal(conductor.email, null);
      assert.equal(conductor.activo, true);
    });
  });

  test("CP-INT-18 · rechaza un RUT repetido en la empresa, aunque esté inactivo, y lo permite en otra", async () => {
    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      await crearConductor(tx, empresa);
      await tx.conductor.updateMany({ where: { empresaId: empresa }, data: { activo: false } });
      await crearConductor(tx, empresa, { rut: "11111111-1", nombre: "Otro nombre" });
    });

    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      await crearConductor(tx, empresaA);
      const enB = await crearConductor(tx, empresaB);
      assert.equal(enB.rut, "11111111-1");
    });
  });

  test("CP-INT-19 · buscar o editar un conductor con la empresa equivocada no encuentra ni cambia nada", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearConductor(tx, empresaB, { nombre: "Conductor de B" });

      // El mismo filtro que usan obtenerConductor() y actualizarConductor().
      const deBDesdeA = conductorDeLaEmpresa(deB.id, empresaA);
      assert.equal(await tx.conductor.findFirst({ where: deBDesdeA }), null);
      await assert.rejects(
        tx.conductor.update({ where: deBDesdeA, data: { activo: false } }),
        (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025",
      );

      const sinCambios = await tx.conductor.findUniqueOrThrow({ where: { id: deB.id } });
      assert.equal(sinCambios.activo, true);
      assert.equal(sinCambios.empresaId, empresaB);
    });
  });

  test("CP-INT-20 · el listado trae solo los conductores de la empresa, ordenados y con su búsqueda", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      await crearConductor(tx, empresaA, { nombre: "María Muñoz", rut: "22.222.222-2" });
      await crearConductor(tx, empresaA, { nombre: "Ana Díaz", rut: "1000005-K" });
      const inactivo = await crearConductor(tx, empresaA, { nombre: "Luis Rojas", rut: "33.333.333-3" });
      await tx.conductor.update({ where: { id: inactivo.id }, data: { activo: false } });
      // Su RUT contiene "222-2" y "1000005": no debe aparecer al buscar desde A.
      await crearConductor(tx, empresaB, { nombre: "María de B", rut: "22.222.222-2" });

      // El mismo filtro y orden que usa listarConductores().
      const listar = async (buscar = "", incluirInactivos = false) =>
        (
          await tx.conductor.findMany({
            where: filtroConductores(empresaA, { buscar, incluirInactivos }),
            orderBy: [{ nombre: "asc" }, { rut: "asc" }],
          })
        ).map(({ nombre }) => nombre);

      assert.deepEqual(await listar(), ["Ana Díaz", "María Muñoz"]);
      assert.deepEqual(await listar("", true), ["Ana Díaz", "Luis Rojas", "María Muñoz"]);
      assert.deepEqual(await listar("MUÑOZ"), ["María Muñoz"]);
      assert.deepEqual(await listar("maría   muñoz"), ["María Muñoz"]);
      for (const rut of ["22.222", "222222222", "22222222-2", "1000005k"]) {
        assert.equal((await listar(rut)).length, 1, rut);
      }
      // Un RUT parcial no inventa un guion: "1000005" no es "100000-5".
      assert.deepEqual(await listar("1000005"), ["Ana Díaz"]);
      assert.deepEqual(await listar("3333"), []);
      assert.deepEqual(await listar("3333", true), ["Luis Rojas"]);
    });
  });
});

// PB-24. Sin número de caso todavía: se registran en SIM-04 junto con sus casos funcionales.
describe("Conductor asignado al vehículo en la base de datos", { skip: sinBase }, () => {
  test("PB-24 · un conductor puede estar asignado a varios vehículos y el vehículo puede no tener", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const conductor = await crearConductor(tx, empresa);
      await crearVehiculo(tx, empresa, { patente: "BBCD12", conductorId: conductor.id });
      await crearVehiculo(tx, empresa, { patente: "AB1234", conductorId: conductor.id });
      const sinConductor = await crearVehiculo(tx, empresa, { patente: "FGHJ34" });

      // El mismo filtro y orden que usa vehiculosDelConductor().
      const asignados = await tx.vehiculo.findMany({
        where: { empresaId: empresa, conductorId: conductor.id },
        orderBy: { patente: "asc" },
      });
      assert.deepEqual(
        asignados.map(({ patente }) => patente),
        ["AB1234", "BBCD12"],
      );
      assert.equal(sinConductor.conductorId, null);
    });
  });

  test("PB-24 · no se puede asignar un conductor de otra empresa (clave foránea compuesta)", async () => {
    await debeFallar("P2003", async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearConductor(tx, empresaB);
      await crearVehiculo(tx, empresaA, { conductorId: deB.id });
    });
  });
});

// PB-11 a PB-13, con los criterios de JOA-10 (sección 6). Sin número de caso todavía: se
// registran en SIM-04 junto con CP-FUN-23 a CP-FUN-25.
// Usan una fecha fija como "hoy", para que el estado de cada documento no dependa del día.
// Que el dueño esté activo y que el tipo de dueño no cambie al editar lo comprueba la aplicación
// (src/lib/documentos-datos.ts); aquí se prueba lo que además impide la base de datos.

const HOY = "2026-11-18";

/** Valida con el mismo esquema del formulario y del servidor (src/lib/documentos.ts). */
async function crearDocumento(tx: Tx, empresaId: string, cambios: Record<string, unknown>) {
  const resultado = validarDocumento({ fechaVencimiento: sumarDias(HOY, 60), ...cambios }, HOY);
  assert.ok(resultado.ok, `Datos de prueba inválidos: ${JSON.stringify(resultado)}`);
  // Igual que datosParaBase() en src/lib/documentos-datos.ts.
  const { fechaVencimiento, ...datos } = resultado.datos;
  return tx.documento.create({
    data: { ...datos, fechaVencimiento: fechaParaBase(fechaVencimiento), empresaId },
  });
}

/** Una transacción que la base debe rechazar por la restricción indicada; al fallar se deshace sola. */
async function debeRechazarPor(restriccion: string, prueba: (tx: Tx) => Promise<unknown>) {
  await assert.rejects(
    prisma.$transaction(prueba, { maxWait: 10_000, timeout: 30_000 }),
    (error) => error instanceof Error && error.message.includes(restriccion),
  );
}

type DatosSinValidar = (
  vehiculoId: string,
  conductorId: string,
) => Omit<Prisma.DocumentoUncheckedCreateInput, "empresaId" | "fechaVencimiento">;

describe("Documentos en la base de datos", { skip: sinBase }, () => {
  test("PB-11 · guarda un documento de un vehículo y uno de un conductor tal como los valida el formulario (JOA-10, criterio 1)", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, empresa);
      const conductor = await crearConductor(tx, empresa);
      await crearDocumento(tx, empresa, {
        tipo: "soap",
        vehiculoId: vehiculo.id,
        conductorId: "",
        descripcion: "  ",
        fechaVencimiento: "31-03-2027",
        observaciones: "",
      });
      await crearDocumento(tx, empresa, {
        tipo: "licencia_conducir",
        conductorId: conductor.id,
        descripcion: " Clase A3 ",
        fechaVencimiento: "2027-01-17",
        observaciones: " Renovar en la municipalidad ",
      });

      const [licencia, soap] = await tx.documento.findMany({
        where: { empresaId: empresa },
        orderBy: ORDEN_DOCUMENTOS,
      });
      assert.equal(licencia.tipo, "licencia_conducir");
      assert.equal(licencia.conductorId, conductor.id);
      assert.equal(licencia.vehiculoId, null);
      assert.equal(licencia.descripcion, "Clase A3");
      assert.equal(licencia.observaciones, "Renovar en la municipalidad");
      assert.equal(fechaDesdeBase(licencia.fechaVencimiento), "2027-01-17");
      assert.equal(soap.tipo, "soap");
      assert.equal(soap.vehiculoId, vehiculo.id);
      assert.equal(soap.conductorId, null);
      assert.equal(soap.descripcion, null);
      assert.equal(soap.observaciones, null);
      assert.equal(fechaDesdeBase(soap.fechaVencimiento), "2027-03-31");
    });
  });

  test("PB-11 · la base rechaza un tipo que no corresponde al dueño, un documento sin dueño o con dos, y un «otro» sin descripción (JOA-10, criterio 2)", async () => {
    const casos: [string, DatosSinValidar][] = [
      ["documento_tipo_dueno_check", (_, conductorId) => ({ tipo: "soap", conductorId })],
      ["documento_tipo_dueno_check", (vehiculoId) => ({ tipo: "licencia_conducir", vehiculoId })],
      ["documento_un_dueno_check", () => ({ tipo: "otro", descripcion: "Seguro de pasajeros" })],
      [
        "documento_un_dueno_check",
        (vehiculoId, conductorId) => ({ tipo: "otro", descripcion: "Seguro", vehiculoId, conductorId }),
      ],
      ["documento_descripcion_otro_check", (vehiculoId) => ({ tipo: "otro", vehiculoId })],
    ];
    for (const [restriccion, datos] of casos) {
      await debeRechazarPor(restriccion, async (tx) => {
        const empresa = await crearEmpresa(tx, "Empresa A");
        const vehiculo = await crearVehiculo(tx, empresa);
        const conductor = await crearConductor(tx, empresa);
        await tx.documento.create({
          data: {
            ...datos(vehiculo.id, conductor.id),
            empresaId: empresa,
            fechaVencimiento: fechaParaBase(sumarDias(HOY, 60)),
          },
        });
      });
    }
  });

  test("PB-11 · un segundo documento del mismo tipo para el mismo dueño se rechaza, aunque el dueño esté inactivo (JOA-10, criterio 3)", async () => {
    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, empresa, { estado: "inactivo" });
      await crearDocumento(tx, empresa, { tipo: "soap", vehiculoId: vehiculo.id });
      await crearDocumento(tx, empresa, {
        tipo: "soap",
        vehiculoId: vehiculo.id,
        fechaVencimiento: sumarDias(HOY, 400),
      });
    });

    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const conductor = await crearConductor(tx, empresa);
      await crearDocumento(tx, empresa, { tipo: "licencia_conducir", conductorId: conductor.id });
      await crearDocumento(tx, empresa, { tipo: "licencia_conducir", conductorId: conductor.id });
    });
  });

  test("PB-11 · «otro» no tiene límite, y el mismo tipo se permite en otro dueño o en otra empresa (JOA-10, criterio 3)", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const furgon = await crearVehiculo(tx, empresaA, { patente: "BBCD12" });
      const bus = await crearVehiculo(tx, empresaA, { patente: "FGHJ34" });
      const deB = await crearVehiculo(tx, empresaB, { patente: "BBCD12" });
      const otro = { tipo: "otro", descripcion: "Seguro de pasajeros", vehiculoId: furgon.id };
      await crearDocumento(tx, empresaA, otro);
      await crearDocumento(tx, empresaA, otro);
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: furgon.id });
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: bus.id });
      await crearDocumento(tx, empresaB, { tipo: "soap", vehiculoId: deB.id });

      const delFurgon = documentosDelDueno(empresaA, { tipo: "vehiculo", id: furgon.id });
      assert.equal(await tx.documento.count({ where: delFurgon }), 3);
      const soaps = { tipo: "soap" as const, empresaId: { in: [empresaA, empresaB] } };
      assert.equal(await tx.documento.count({ where: soaps }), 3);
    });
  });

  test("PB-12 · la fecha se guarda sin correrse de día y el estado se calcula con ella (JOA-10, criterios 4 y 5)", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, empresa);
      const { minima, maxima } = rangoDeFechas(HOY);
      // La fecha pasada y los dos extremos del rango los acepta el formulario.
      const fechas = [minima, sumarDias(HOY, -1), HOY, sumarDias(HOY, 30), sumarDias(HOY, 31), maxima];
      for (const fecha of fechas) {
        await crearDocumento(tx, empresa, {
          tipo: "otro",
          descripcion: `Vence el ${fecha}`,
          vehiculoId: vehiculo.id,
          fechaVencimiento: fecha,
        });
      }

      const guardados = await tx.documento.findMany({
        where: { empresaId: empresa },
        orderBy: ORDEN_DOCUMENTOS,
      });
      const leidas = guardados.map(({ fechaVencimiento }) => fechaDesdeBase(fechaVencimiento));
      assert.deepEqual(leidas, fechas);
      assert.deepEqual(
        leidas.map((fecha) => calcularEstado(fecha, HOY).estado),
        ["vencido", "vencido", "por_vencer", "por_vencer", "vigente", "vigente"],
      );
    });
  });

  test("PB-12 · el listado trae solo los documentos de la empresa, ordenados por vencimiento y con los filtros de estado y tipo (JOA-10, criterios 7 y 13)", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const furgon = await crearVehiculo(tx, empresaA, { patente: "BBCD12" });
      const conductor = await crearConductor(tx, empresaA);
      const deB = await crearVehiculo(tx, empresaB, { patente: "BBCD12" });
      const vence = (dias: number) => sumarDias(HOY, dias);
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: furgon.id, fechaVencimiento: vence(31) });
      await crearDocumento(tx, empresaA, {
        tipo: "revision_tecnica",
        vehiculoId: furgon.id,
        fechaVencimiento: vence(-1),
      });
      await crearDocumento(tx, empresaA, {
        tipo: "permiso_circulacion",
        vehiculoId: furgon.id,
        fechaVencimiento: vence(30),
      });
      await crearDocumento(tx, empresaA, {
        tipo: "licencia_conducir",
        conductorId: conductor.id,
        fechaVencimiento: HOY,
      });
      await crearDocumento(tx, empresaB, { tipo: "soap", vehiculoId: deB.id, fechaVencimiento: HOY });

      // El mismo filtro y orden que usa listarDocumentos().
      const listar = async (filtro: FiltroDocumentos = {}) =>
        (
          await tx.documento.findMany({
            where: filtroDocumentos(empresaA, HOY, filtro),
            orderBy: ORDEN_DOCUMENTOS,
          })
        ).map(({ tipo }) => tipo);

      assert.deepEqual(await listar(), ["revision_tecnica", "licencia_conducir", "permiso_circulacion", "soap"]);
      assert.deepEqual(await listar({ estado: "vencido" }), ["revision_tecnica"]);
      assert.deepEqual(await listar({ estado: "por_vencer" }), ["licencia_conducir", "permiso_circulacion"]);
      assert.deepEqual(await listar({ estado: "vigente" }), ["soap"]);
      assert.deepEqual(await listar({ tipo: "soap" }), ["soap"]);
      assert.deepEqual(await listar({ estado: "por_vencer", tipo: "soap" }), []);
    });
  });

  test("PB-12 · los documentos de dueños inactivos no aparecen por defecto; con «Incluir inactivos», sí (JOA-10, criterio 8)", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const activo = await crearVehiculo(tx, empresa, { patente: "AB1234" });
      const enMantencion = await crearVehiculo(tx, empresa, { patente: "BBCD12", estado: "en_mantencion" });
      const inactivo = await crearVehiculo(tx, empresa, { patente: "FGHJ34", estado: "inactivo" });
      const conductorActivo = await crearConductor(tx, empresa, { rut: "22.222.222-2" });
      const conductorInactivo = await crearConductor(tx, empresa, { rut: "33.333.333-3" });
      await tx.conductor.update({ where: { id: conductorInactivo.id }, data: { activo: false } });

      const de = (observaciones: string, dueno: Record<string, string>) => ({
        tipo: "otro",
        descripcion: "Documento de prueba",
        observaciones,
        ...dueno,
      });
      await crearDocumento(tx, empresa, de("vehículo activo", { vehiculoId: activo.id }));
      await crearDocumento(tx, empresa, de("vehículo en mantención", { vehiculoId: enMantencion.id }));
      await crearDocumento(tx, empresa, de("vehículo inactivo", { vehiculoId: inactivo.id }));
      await crearDocumento(tx, empresa, de("conductor activo", { conductorId: conductorActivo.id }));
      await crearDocumento(tx, empresa, de("conductor inactivo", { conductorId: conductorInactivo.id }));

      // Todos vencen el mismo día y son del mismo tipo: se comparan sin importar el orden.
      const listar = async (incluirInactivos: boolean) =>
        (await tx.documento.findMany({ where: filtroDocumentos(empresa, HOY, { incluirInactivos }) }))
          .map(({ observaciones }) => observaciones)
          .sort();

      assert.deepEqual(await listar(false), ["conductor activo", "vehículo activo", "vehículo en mantención"]);
      assert.deepEqual(await listar(true), [
        "conductor activo",
        "conductor inactivo",
        "vehículo activo",
        "vehículo en mantención",
        "vehículo inactivo",
      ]);
    });
  });

  test("PB-12 · la ficha de un vehículo o de un conductor trae solo sus documentos, aunque esté inactivo (JOA-10, criterios 9 y 13)", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const inactivo = await crearVehiculo(tx, empresaA, { patente: "BBCD12", estado: "inactivo" });
      const otroVehiculo = await crearVehiculo(tx, empresaA, { patente: "FGHJ34" });
      const conductor = await crearConductor(tx, empresaA);
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: inactivo.id });
      await crearDocumento(tx, empresaA, { tipo: "revision_tecnica", vehiculoId: inactivo.id });
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: otroVehiculo.id });
      await crearDocumento(tx, empresaA, { tipo: "licencia_conducir", conductorId: conductor.id });

      // El mismo filtro y orden que usa documentosDe().
      const ficha = async (empresa: string, dueno: { tipo: "vehiculo" | "conductor"; id: string }) =>
        (await tx.documento.findMany({ where: documentosDelDueno(empresa, dueno), orderBy: ORDEN_DOCUMENTOS })).map(
          ({ tipo }) => tipo,
        );

      assert.deepEqual(await ficha(empresaA, { tipo: "vehiculo", id: inactivo.id }), ["revision_tecnica", "soap"]);
      assert.deepEqual(await ficha(empresaA, { tipo: "conductor", id: conductor.id }), ["licencia_conducir"]);
      // Desde otra empresa, la ficha del mismo vehículo no trae nada.
      assert.deepEqual(await ficha(empresaB, { tipo: "vehiculo", id: inactivo.id }), []);
    });
  });

  test("PB-13 · renovar cambia la fecha y el estado se recalcula (JOA-10, criterio 11)", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, empresa);
      const documento = await crearDocumento(tx, empresa, {
        tipo: "revision_tecnica",
        vehiculoId: vehiculo.id,
        fechaVencimiento: sumarDias(HOY, -10),
      });

      const estado = async () => {
        const guardado = await tx.documento.findUniqueOrThrow({ where: { id: documento.id } });
        return calcularEstado(fechaDesdeBase(guardado.fechaVencimiento), HOY).estado;
      };
      // La misma condición que actualizarDocumento(): id y empresa de la sesión.
      const renovar = (fecha: string) =>
        tx.documento.update({
          where: documentoDeLaEmpresa(documento.id, empresa),
          data: { fechaVencimiento: fechaParaBase(fecha) },
        });

      assert.equal(await estado(), "vencido");
      await renovar(sumarDias(HOY, 365));
      assert.equal(await estado(), "vigente");
      await renovar(sumarDias(HOY, 20));
      assert.equal(await estado(), "por_vencer");
    });
  });

  test("PB-13 · el dueño se puede cambiar a otro vehículo, pero no a uno que ya tiene ese tipo ni a un conductor (JOA-10, criterio 12)", async () => {
    await sinGuardar(async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const furgon = await crearVehiculo(tx, empresa, { patente: "BBCD12" });
      const bus = await crearVehiculo(tx, empresa, { patente: "FGHJ34" });
      const soap = await crearDocumento(tx, empresa, { tipo: "soap", vehiculoId: furgon.id });

      await tx.documento.update({
        where: documentoDeLaEmpresa(soap.id, empresa),
        data: { vehiculoId: bus.id },
      });
      const deCada = (vehiculo: { id: string }) =>
        tx.documento.count({ where: documentosDelDueno(empresa, { tipo: "vehiculo", id: vehiculo.id }) });
      assert.equal(await deCada(furgon), 0);
      assert.equal(await deCada(bus), 1);
    });

    await debeFallar("P2002", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const furgon = await crearVehiculo(tx, empresa, { patente: "BBCD12" });
      const bus = await crearVehiculo(tx, empresa, { patente: "FGHJ34" });
      const soap = await crearDocumento(tx, empresa, { tipo: "soap", vehiculoId: furgon.id });
      await crearDocumento(tx, empresa, { tipo: "soap", vehiculoId: bus.id });
      await tx.documento.update({
        where: documentoDeLaEmpresa(soap.id, empresa),
        data: { vehiculoId: bus.id },
      });
    });

    await debeRechazarPor("documento_tipo_dueno_check", async (tx) => {
      const empresa = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, empresa);
      const conductor = await crearConductor(tx, empresa);
      const soap = await crearDocumento(tx, empresa, { tipo: "soap", vehiculoId: vehiculo.id });
      await tx.documento.update({
        where: documentoDeLaEmpresa(soap.id, empresa),
        data: { vehiculoId: null, conductorId: conductor.id },
      });
    });
  });

  test("PB-11 a PB-13 · con la empresa equivocada un documento no se encuentra ni se edita (JOA-10, criterios 13 y 14)", async () => {
    await sinGuardar(async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearVehiculo(tx, empresaB);
      const documento = await crearDocumento(tx, empresaB, {
        tipo: "soap",
        vehiculoId: deB.id,
        observaciones: "De la empresa B",
      });

      // Las mismas condiciones que obtenerDocumento() y actualizarDocumento().
      const deBDesdeA = documentoDeLaEmpresa(documento.id, empresaA);
      assert.equal(await tx.documento.findFirst({ where: deBDesdeA }), null);
      await assert.rejects(
        tx.documento.update({ where: deBDesdeA, data: { observaciones: "Cambiado desde A" } }),
        (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025",
      );
      const listadoDeA = filtroDocumentos(empresaA, HOY, { incluirInactivos: true });
      assert.equal(await tx.documento.count({ where: listadoDeA }), 0);

      const sinCambios = await tx.documento.findUniqueOrThrow({ where: { id: documento.id } });
      assert.equal(sinCambios.observaciones, "De la empresa B");
      assert.equal(sinCambios.empresaId, empresaB);
    });
  });

  test("PB-11 · no se puede registrar un documento para un vehículo o conductor de otra empresa (JOA-10, criterio 14)", async () => {
    await debeFallar("P2003", async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearVehiculo(tx, empresaB);
      await crearDocumento(tx, empresaA, { tipo: "soap", vehiculoId: deB.id });
    });

    await debeFallar("P2003", async (tx) => {
      const empresaA = await crearEmpresa(tx, "Empresa A");
      const empresaB = await crearEmpresa(tx, "Empresa B");
      const deB = await crearConductor(tx, empresaB);
      await crearDocumento(tx, empresaA, { tipo: "licencia_conducir", conductorId: deB.id });
    });
  });
});

describe("Seguridad del esquema", { skip: sinBase }, () => {
  test("CP-INT-10 · RLS activado en las tablas y sin columna de contraseña en usuario", async () => {
    const tablas = await prisma.$queryRaw<{ tabla: string; rls: boolean }[]>`
      select relname as tabla, relrowsecurity as rls
      from pg_class
      where relnamespace = 'public'::regnamespace
        and relname in ('aviso_enviado', 'conductor', 'documento', 'empresa', 'usuario', 'vehiculo')
      order by relname`;
    assert.deepEqual(tablas, [
      { tabla: "aviso_enviado", rls: true },
      { tabla: "conductor", rls: true },
      { tabla: "documento", rls: true },
      { tabla: "empresa", rls: true },
      { tabla: "usuario", rls: true },
      { tabla: "vehiculo", rls: true },
    ]);

    const columnas = await prisma.$queryRaw<{ columna: string }[]>`
      select column_name as columna
      from information_schema.columns
      where table_schema = 'public' and table_name = 'usuario'`;
    assert.ok(columnas.length > 0, "No se encontró la tabla usuario.");
    assert.ok(
      columnas.every(({ columna }) => !/pass|contrase|clave|hash/i.test(columna)),
      `Columnas de usuario: ${columnas.map(({ columna }) => columna).join(", ")}`,
    );
  });

  test("no quedan datos de estas pruebas en la base", async () => {
    const sobrantes = await prisma.empresa.count({
      where: { nombre: { endsWith: NOMBRE_DE_PRUEBA } },
    });
    assert.equal(sobrantes, 0);
  });
});
