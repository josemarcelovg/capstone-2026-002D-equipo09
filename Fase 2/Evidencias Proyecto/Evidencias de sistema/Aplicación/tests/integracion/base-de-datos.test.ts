import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client.ts";
import { validarConductor } from "../../src/lib/conductores.ts";
import { conductorDeLaEmpresa, filtroConductores } from "../../src/lib/conductores-filtros.ts";
import { formatearPatente, normalizarPatente, validarVehiculo } from "../../src/lib/vehiculos.ts";

// Pruebas de integración de la aplicación con la base de datos (SIM-04, CP-INT-01 a CP-INT-10,
// y CP-INT-17 a CP-INT-20 para conductores).
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

describe("Seguridad del esquema", { skip: sinBase }, () => {
  test("CP-INT-10 · RLS activado en las tablas y sin columna de contraseña en usuario", async () => {
    const tablas = await prisma.$queryRaw<{ tabla: string; rls: boolean }[]>`
      select relname as tabla, relrowsecurity as rls
      from pg_class
      where relnamespace = 'public'::regnamespace
        and relname in ('conductor', 'empresa', 'usuario', 'vehiculo')
      order by relname`;
    assert.deepEqual(tablas, [
      { tabla: "conductor", rls: true },
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
