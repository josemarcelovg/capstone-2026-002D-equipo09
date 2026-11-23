import assert from "node:assert/strict";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../../src/generated/prisma/client.ts";
import { filtroDocumentos } from "../../src/lib/documentos-filtros.ts";
import { fechaParaBase } from "../../src/lib/fechas.ts";
import { resumenDeLaFlota } from "../../src/lib/resumen-datos.ts";

// Pruebas del resumen de la flota (JOS-21) con la base de datos, con el ejemplo de JOA-50,
// sección 5. Cada prueba trabaja en una transacción que se deshace al final.

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de integración)";
const HOY = "2026-12-15";

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

async function crearEmpresa(tx: Tx, nombre: string) {
  const empresa = await tx.empresa.create({
    data: { nombre: `${nombre} ${NOMBRE_DE_PRUEBA}`, emailContacto: "contacto@ejemplo.cl" },
    select: { id: true },
  });
  return empresa.id;
}

async function crearVehiculo(tx: Tx, empresaId: string, patente: string, estado: "activo" | "en_mantencion" | "inactivo") {
  return tx.vehiculo.create({
    data: { empresaId, patente, tipo: "van", marca: "Prueba", modelo: "Prueba", anio: 2020, capacidadPasajeros: 15, estado },
    select: { id: true },
  });
}

// Empresa del ejemplo de JOA-50, sección 5: 3 activos, 1 en mantención, 1 inactivo, y sus documentos.
async function empresaDelEjemplo(tx: Tx, nombre: string) {
  const empresaId = await crearEmpresa(tx, nombre);
  const [activo] = [
    await crearVehiculo(tx, empresaId, "BBCD12", "activo"),
    await crearVehiculo(tx, empresaId, "FGHJ34", "activo"),
    await crearVehiculo(tx, empresaId, "KLPR56", "activo"),
  ];
  const enMantencion = await crearVehiculo(tx, empresaId, "HJKL78", "en_mantencion");
  const inactivo = await crearVehiculo(tx, empresaId, "XY4321", "inactivo");
  const conductor = await tx.conductor.create({
    data: { empresaId, nombre: "Pedro Soto", rut: "11111111-1", telefono: "+56900000001" },
    select: { id: true },
  });

  const documento = (datos: Omit<Prisma.DocumentoUncheckedCreateInput, "empresaId" | "fechaVencimiento">, vence: string) =>
    tx.documento.create({ data: { ...datos, empresaId, fechaVencimiento: fechaParaBase(vence) } });
  await documento({ tipo: "soap", vehiculoId: activo.id }, "2026-12-10");
  await documento({ tipo: "revision_tecnica", vehiculoId: activo.id }, "2026-12-15");
  await documento({ tipo: "permiso_circulacion", vehiculoId: enMantencion.id }, "2027-01-05");
  await documento({ tipo: "licencia_conducir", conductorId: conductor.id }, "2027-06-30");
  await documento({ tipo: "soap", vehiculoId: inactivo.id }, "2026-12-01");

  return { empresaId, activo, conductor };
}

describe("Resumen de la flota", { skip: sinBase }, () => {
  test("PB-20 · el ejemplo de JOA-50 da 3 activos, 1 en mantención, 1 inactivo, 1 vencido y 2 por vencer con 1 que vence hoy (criterios 1, 3 y 4)", async () => {
    await sinGuardar(async (tx) => {
      const { empresaId } = await empresaDelEjemplo(tx, "Empresa A");
      assert.deepEqual(await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY }), {
        vehiculos: { activo: 3, en_mantencion: 1, inactivo: 1, total: 5 },
        documentos: { total: 4, vencidos: 1, porVencer: 2, vencenHoy: 1 },
      });
    });
  });

  test("PB-20 · cada número coincide con lo que muestra su listado (JOA-50, criterios 2 y 5)", async () => {
    await sinGuardar(async (tx) => {
      const { empresaId } = await empresaDelEjemplo(tx, "Empresa A");
      const { vehiculos, documentos } = await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY });

      // Mismas condiciones que listarVehiculos() con los filtros de cada enlace.
      const listado = (estado: "activo" | "en_mantencion" | "inactivo" | undefined, incluirInactivos: boolean) =>
        tx.vehiculo.count({
          where: { empresaId, patente: { contains: "" }, estado: estado ?? (incluirInactivos ? undefined : { not: "inactivo" }) },
        });
      assert.equal(await listado("activo", false), vehiculos.activo);
      assert.equal(await listado("en_mantencion", false), vehiculos.en_mantencion);
      assert.equal(await listado("inactivo", true), vehiculos.inactivo);
      assert.equal(await listado(undefined, true), vehiculos.total);

      // Mismo filtro que listarDocumentos().
      const deEstado = (estado: "vencido" | "por_vencer") =>
        tx.documento.count({ where: filtroDocumentos(empresaId, HOY, { estado }) });
      assert.equal(await deEstado("vencido"), documentos.vencidos);
      assert.equal(await deEstado("por_vencer"), documentos.porVencer);
    });
  });

  test("PB-20 · un documento que vence hoy está por vencer, y desde mañana cuenta como vencido (JOA-50, criterio 6)", async () => {
    await sinGuardar(async (tx) => {
      const { empresaId } = await empresaDelEjemplo(tx, "Empresa A");
      const manana = await resumenDeLaFlota({ db: tx, empresaId, hoy: "2026-12-16" });
      assert.deepEqual(manana.documentos, { total: 4, vencidos: 2, porVencer: 1, vencenHoy: 0 });
    });
  });

  test("PB-20 · una empresa sin datos ve ceros, y con documentos sin avisos queda «al día» (JOA-50, criterios 8 y 9)", async () => {
    await sinGuardar(async (tx) => {
      const empresaId = await crearEmpresa(tx, "Empresa nueva");
      assert.deepEqual(await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY }), {
        vehiculos: { activo: 0, en_mantencion: 0, inactivo: 0, total: 0 },
        documentos: { total: 0, vencidos: 0, porVencer: 0, vencenHoy: 0 },
      });

      const { id } = await crearVehiculo(tx, empresaId, "BBCD12", "activo");
      await tx.documento.create({
        data: { empresaId, tipo: "soap", vehiculoId: id, fechaVencimiento: fechaParaBase("2027-03-31") },
      });
      const alDia = await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY });
      assert.deepEqual(alDia.documentos, { total: 1, vencidos: 0, porVencer: 0, vencenHoy: 0 });
    });
  });

  test("PB-20 · cada empresa ve solo sus totales: los datos de otra no cambian el resumen (JOA-50, criterio 10)", async () => {
    await sinGuardar(async (tx) => {
      const { empresaId } = await empresaDelEjemplo(tx, "Empresa A");
      const antes = await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY });

      const otra = await empresaDelEjemplo(tx, "Empresa B");
      await crearVehiculo(tx, otra.empresaId, "ZZZZ99", "activo");
      await tx.vehiculo.updateMany({ where: { empresaId: otra.empresaId, estado: "activo" }, data: { estado: "inactivo" } });
      await tx.conductor.update({ where: { id: otra.conductor.id }, data: { activo: false } });

      assert.deepEqual(await resumenDeLaFlota({ db: tx, empresaId, hoy: HOY }), antes);
    });
  });

  test("no quedan datos de estas pruebas en la base", async () => {
    const sobrantes = await prisma.empresa.count({ where: { nombre: { endsWith: NOMBRE_DE_PRUEBA } } });
    assert.equal(sobrantes, 0);
  });
});
