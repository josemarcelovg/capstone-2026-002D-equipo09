import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client.ts";
import { procesarAvisos } from "../../src/lib/avisos-datos.ts";
import type { MensajeCorreo } from "../../src/lib/correo.ts";
import { filtroDocumentos, ORDEN_DOCUMENTOS } from "../../src/lib/documentos-filtros.ts";
import { fechaParaBase, hoyEnChile, sumarDias } from "../../src/lib/fechas.ts";
import { normalizarPatente } from "../../src/lib/vehiculos.ts";

// Pruebas de rendimiento con una empresa de 100 vehículos y 300 documentos, dentro de una
// transacción que se deshace al final. Miden el tiempo de las consultas y del proceso de avisos.
// Desde el computador se descuenta la latencia a la base (unos 235 ms hasta Oregón).

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: [{ emit: "event", level: "query" }],
});

// Cuenta las consultas SQL que hace Prisma.
let consultasSql = 0;
prisma.$on("query", () => {
  consultasSql++;
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de rendimiento)";
const VEHICULOS = 100;
const TIPOS_DE_VEHICULO = ["soap", "revision_tecnica", "permiso_circulacion"] as const;

// Búsqueda y filtros en 1 segundo o menos.
const LIMITE_LISTADO_MS = 1_000;
// El proceso de avisos termina en menos de 5 minutos.
const LIMITE_AVISOS_MS = 5 * 60 * 1_000;
// Se repite cada consulta y se toma la mediana.
const REPETICIONES = 5;

const AHORA = new Date();
const HOY = hoyEnChile(AHORA);

class Deshacer extends Error {}

// Corre la prueba en una transacción y la deshace al final.
async function sinGuardar(prueba: (tx: Tx) => Promise<void>, timeout: number) {
  try {
    await prisma.$transaction(
      async (tx) => {
        await prueba(tx);
        throw new Deshacer();
      },
      { maxWait: 10_000, timeout },
    );
  } catch (error) {
    if (!(error instanceof Deshacer)) throw error;
  }
}

// Empresa de prueba con 100 vehículos y 3 documentos cada uno (vencidos, por vencer y vigentes).
async function crearFlota(tx: Tx) {
  const empresa = await tx.empresa.create({
    data: { nombre: `Empresa ${NOMBRE_DE_PRUEBA}`, emailContacto: `rendimiento-${randomUUID()}@micrologist.example` },
    select: { id: true },
  });
  const vehiculos = await tx.vehiculo.createManyAndReturn({
    data: Array.from({ length: VEHICULOS }, (_, i) => ({
      empresaId: empresa.id,
      patente: `RN${String(i + 1).padStart(4, "0")}`,
      tipo: "van" as const,
      marca: "Prueba",
      modelo: "Rendimiento",
      anio: 2022,
      capacidadPasajeros: 12,
      estado: i < 80 ? ("activo" as const) : i < 90 ? ("en_mantencion" as const) : ("inactivo" as const),
    })),
    select: { id: true },
  });
  await tx.documento.createMany({
    data: vehiculos.flatMap((vehiculo, i) =>
      TIPOS_DE_VEHICULO.map((tipo, k) => ({
        empresaId: empresa.id,
        vehiculoId: vehiculo.id,
        tipo,
        fechaVencimiento: fechaParaBase(sumarDias(HOY, ((i * 7 + k * 11) % 61) - 15)),
      })),
    ),
  });
  return empresa.id;
}

// Mediana de varias ejecuciones y cuántas consultas SQL hace cada una.
async function medir(consulta: () => Promise<unknown>) {
  const antes = consultasSql;
  await consulta();
  const consultas = consultasSql - antes;
  const tiempos: number[] = [];
  for (let vez = 0; vez < REPETICIONES; vez++) {
    const inicio = performance.now();
    await consulta();
    tiempos.push(performance.now() - inicio);
  }
  tiempos.sort((a, b) => a - b);
  return { ms: Math.round(tiempos[Math.floor(tiempos.length / 2)]), consultas };
}

describe("Rendimiento con la base de datos", { skip: sinBase }, () => {
  test("CP-REN-03 · las consultas del listado, la búsqueda y los filtros con 100 vehículos tardan 1 s o menos", async (t) => {
    await sinGuardar(async (tx) => {
      const empresaId = await crearFlota(tx);

      // Misma consulta que listarVehiculos().
      const listarVehiculos = (patente = "", estado?: "en_mantencion", incluirInactivos = false) =>
        tx.vehiculo.findMany({
          where: {
            empresaId,
            patente: { contains: normalizarPatente(patente) },
            estado: estado ?? (incluirInactivos ? undefined : { not: "inactivo" }),
          },
          select: {
            id: true,
            patente: true,
            tipo: true,
            marca: true,
            modelo: true,
            anio: true,
            capacidadPasajeros: true,
            numeroInterno: true,
            color: true,
            estado: true,
            observaciones: true,
            conductorId: true,
          },
          orderBy: { patente: "asc" },
        });

      // Misma consulta que listarDocumentos().
      const listarDocumentos = (filtro: Parameters<typeof filtroDocumentos>[2] = {}) =>
        tx.documento.findMany({
          where: filtroDocumentos(empresaId, HOY, filtro),
          select: {
            id: true,
            tipo: true,
            descripcion: true,
            fechaVencimiento: true,
            observaciones: true,
            vehiculo: { select: { id: true, patente: true, estado: true } },
            conductor: { select: { id: true, nombre: true, activo: true } },
          },
          orderBy: ORDEN_DOCUMENTOS,
        });

      // Se revisa que las consultas devuelvan lo esperado; si no, la medición no sirve.
      assert.equal((await listarVehiculos()).length, 90);
      assert.equal((await listarVehiculos("", undefined, true)).length, 100);
      assert.equal((await listarDocumentos()).length, 270);
      assert.equal((await listarDocumentos({ incluirInactivos: true })).length, 300);

      // Latencia de ida y vuelta a la base, sin trabajo de la base.
      const { ms: latencia } = await medir(() => tx.$queryRaw`SELECT 1`);
      t.diagnostic(`Latencia de un SELECT 1: ${latencia} ms`);

      const casos: [string, () => Promise<unknown>][] = [
        ["Vehículos: listado", () => listarVehiculos()],
        ["Vehículos: búsqueda por patente («rn-00»)", () => listarVehiculos("rn-00")],
        ["Vehículos: filtro «En mantención»", () => listarVehiculos("", "en_mantencion")],
        ["Vehículos: «Incluir inactivos»", () => listarVehiculos("", undefined, true)],
        ["Documentos: listado", () => listarDocumentos()],
        ["Documentos: filtro «Por vencer»", () => listarDocumentos({ estado: "por_vencer" })],
        ["Documentos: filtro por tipo (SOAP)", () => listarDocumentos({ tipo: "soap" })],
        ["Documentos: «Incluir inactivos»", () => listarDocumentos({ incluirInactivos: true })],
      ];
      for (const [nombre, consulta] of casos) {
        const { ms, consultas } = await medir(consulta);
        const sinRed = Math.max(0, ms - consultas * latencia);
        const sql = consultas === 1 ? "1 consulta SQL" : `${consultas} consultas SQL`;
        t.diagnostic(`${nombre}: ${ms} ms en ${sql}; ${sinRed} ms sin la latencia de red`);
        assert.ok(
          sinRed <= LIMITE_LISTADO_MS,
          `${nombre} tardó ${sinRed} ms sin la latencia de red (${ms} ms en total; límite ${LIMITE_LISTADO_MS} ms)`,
        );
      }
    }, 120_000);
  });

  test("CP-REN-04 · el proceso diario de avisos termina en menos de 5 minutos con 300 documentos", async (t) => {
    await sinGuardar(async (tx) => {
      const empresaId = await crearFlota(tx);
      const correos: MensajeCorreo[] = [];

      const antes = consultasSql;
      const inicio = performance.now();
      const resultado = await procesarAvisos({
        db: tx,
        enviar: async (mensaje) => {
          correos.push(mensaje);
        },
        ahora: AHORA,
        urlDocumentos: "https://micrologist.example/documentos",
      });
      const ms = Math.round(performance.now() - inicio);
      const consultas = consultasSql - antes;

      const avisos = await tx.avisoEnviado.count({ where: { empresaId, estado: "enviado" } });
      const esperados = await tx.documento.count({
        where: {
          ...filtroDocumentos(empresaId, HOY),
          fechaVencimiento: { gte: fechaParaBase(HOY), lte: fechaParaBase(sumarDias(HOY, 30)) },
        },
      });
      assert.ok(esperados > 100, `la prueba necesita más de 100 avisos y hay ${esperados}`);
      assert.equal(avisos, esperados);
      assert.equal(resultado.fallidos, 0);

      t.diagnostic(
        `Proceso de avisos: ${ms} ms en ${consultas} consultas SQL, ${resultado.enviados} avisos en ` +
          `${resultado.correos} correos (${avisos} de la empresa de prueba)`,
      );
      assert.ok(ms < LIMITE_AVISOS_MS, `el proceso tardó ${ms} ms (límite ${LIMITE_AVISOS_MS} ms)`);
    }, LIMITE_AVISOS_MS + 60_000);
  });

  test("no quedan datos de estas pruebas en la base", async () => {
    assert.equal(await prisma.empresa.count({ where: { nombre: { contains: NOMBRE_DE_PRUEBA } } }), 0);
  });
});
