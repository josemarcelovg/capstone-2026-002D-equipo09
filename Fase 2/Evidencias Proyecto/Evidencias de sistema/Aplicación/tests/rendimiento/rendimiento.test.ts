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

// Pruebas de rendimiento con la base de datos (SIM-04, CP-REN-03 y CP-REN-04; RNF-REN-03 y
// RNF-REN-04 de JOA-05). Usan el cliente Prisma generado y la base de DATABASE_URL, igual que la
// aplicación, con una empresa de 100 vehículos y 300 documentos.
//
// No dejan datos ni mandan correos: cada prueba crea sus datos dentro de una transacción que se
// deshace al final, y el envío de los avisos lo reemplaza una función que solo cuenta los correos.
//
// Miden la parte de la base de datos: el tiempo que tarda la consulta de cada pantalla y el
// proceso diario completo. El tiempo de carga en el navegador (CP-REN-01) se mide con Lighthouse.
//
// Los umbrales son para la versión publicada, donde la función de Vercel y la base están en la
// misma región (JOA-05, sección 3; SIM-10). Desde el computador de desarrollo, cada consulta SQL
// cruza hasta la base y vuelve (unos 235 ms de Chile a Oregón), así que el listado se compara
// descontando esa latencia: la que mide un `SELECT 1`, por cada consulta SQL que hace Prisma.

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: [{ emit: "event", level: "query" }],
});

/** Cuántas consultas SQL lleva enviadas Prisma; sirve para contar las de cada listado. */
let consultasSql = 0;
prisma.$on("query", () => {
  consultasSql++;
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de rendimiento)";
const VEHICULOS = 100;
const TIPOS_DE_VEHICULO = ["soap", "revision_tecnica", "permiso_circulacion"] as const;

/** RNF-REN-03: búsqueda y filtros en 1 segundo o menos. */
const LIMITE_LISTADO_MS = 1_000;
/** RNF-REN-04: el proceso diario de avisos termina en menos de 5 minutos. */
const LIMITE_AVISOS_MS = 5 * 60 * 1_000;
/** Cada consulta se repite y se toma la mediana, como las 3 mediciones de JOA-05. */
const REPETICIONES = 5;

const AHORA = new Date();
const HOY = hoyEnChile(AHORA);

class Deshacer extends Error {}

/** Ejecuta la prueba dentro de una transacción y la deshace siempre, aunque todo salga bien. */
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

/**
 * Una empresa con 100 vehículos (80 activos, 10 en mantención y 10 inactivos) y sus 3
 * documentos de vehículo cada uno, con vencimientos repartidos entre hace 15 días y 45 días más:
 * hay vencidos, por vencer y vigentes. Patentes `RN0001` a `RN0100`.
 */
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

/**
 * Mediana en milisegundos de `REPETICIONES` ejecuciones, después de una de calentamiento, y
 * cuántas consultas SQL hace cada ejecución.
 */
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

      // Misma consulta que listarVehiculos() en src/lib/vehiculos-datos.ts.
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

      // Misma consulta que listarDocumentos() en src/lib/documentos-datos.ts.
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

      // Las consultas devuelven lo esperado: si no, la medición no sirve.
      assert.equal((await listarVehiculos()).length, 90);
      assert.equal((await listarVehiculos("", undefined, true)).length, 100);
      assert.equal((await listarDocumentos()).length, 270);
      assert.equal((await listarDocumentos({ incluirInactivos: true })).length, 300);

      // Latencia de red de un viaje de ida y vuelta a la base, sin trabajo de la base.
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

      // Los avisos de la empresa de prueba: sus documentos de dueños activos que vencen de hoy a 30 días.
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
