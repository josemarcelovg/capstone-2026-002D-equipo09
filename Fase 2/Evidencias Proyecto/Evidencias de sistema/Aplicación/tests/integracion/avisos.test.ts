import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../src/generated/prisma/client.ts";
import { procesarAvisos } from "../../src/lib/avisos-datos.ts";
import type { MensajeCorreo } from "../../src/lib/correo.ts";
import { fechaDesdeBase, fechaParaBase, hoyEnChile, sumarDias } from "../../src/lib/fechas.ts";

// Pruebas de integración del proceso de avisos por correo con la base de datos (SIM-04,
// CP-INT-24 a CP-INT-28; criterios de JOA-13). Usan el cliente Prisma generado y la base de
// DATABASE_URL, igual que la aplicación.
//
// No dejan datos ni mandan correos: cada prueba trabaja dentro de una transacción que se deshace
// al final, y el envío lo reemplaza una función que solo guarda los correos. El proceso recorre los
// documentos de todas las empresas de la base, así que cada prueba revisa solo los correos y los
// registros de las empresas que creó.

const sinBase = process.env.DATABASE_URL ? false : "Falta DATABASE_URL en el .env (ver .env.example).";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

after(() => prisma.$disconnect());

type Tx = Prisma.TransactionClient;

const NOMBRE_DE_PRUEBA = "(prueba de integración)";
const URL_DOCUMENTOS = "https://micrologist.example/documentos";
const AHORA = new Date();
const HOY = hoyEnChile(AHORA);
const MANANA = new Date(AHORA.getTime() + 24 * 60 * 60 * 1000);

class Deshacer extends Error {}

/** Ejecuta la prueba dentro de una transacción y la deshace siempre, aunque todo salga bien. */
async function sinGuardar(prueba: (tx: Tx) => Promise<void>) {
  try {
    await prisma.$transaction(
      async (tx) => {
        await prueba(tx);
        throw new Deshacer();
      },
      { maxWait: 10_000, timeout: 60_000 },
    );
  } catch (error) {
    if (!(error instanceof Deshacer)) throw error;
  }
}

/** Una empresa nueva con un correo de contacto propio, para encontrar su correo entre los enviados. */
async function crearEmpresa(tx: Tx, nombre: string) {
  const correo = `avisos-${randomUUID()}@micrologist.example`;
  const empresa = await tx.empresa.create({
    data: { nombre: `${nombre} ${NOMBRE_DE_PRUEBA}`, emailContacto: correo },
    select: { id: true },
  });
  return { id: empresa.id, correo };
}

async function crearVehiculo(tx: Tx, empresaId: string, patente: string, estado: "activo" | "inactivo" = "activo") {
  return tx.vehiculo.create({
    data: { empresaId, patente, tipo: "van", marca: "Prueba", modelo: "Avisos", anio: 2022, capacidadPasajeros: 12, estado },
    select: { id: true },
  });
}

async function crearConductor(tx: Tx, empresaId: string, activo = true) {
  return tx.conductor.create({
    data: { empresaId, nombre: "Conductor de prueba", rut: "11111111-1", telefono: "+56900000001", activo },
    select: { id: true },
  });
}

/** Un documento que vence en `dias` días contados desde hoy en Chile. */
async function crearDocumento(
  tx: Tx,
  empresaId: string,
  dias: number,
  dueno: { vehiculoId: string } | { conductorId: string },
  tipo: "soap" | "revision_tecnica" | "permiso_circulacion" | "licencia_conducir" = "soap",
) {
  return tx.documento.create({
    data: { empresaId, tipo, ...dueno, fechaVencimiento: fechaParaBase(sumarDias(HOY, dias)) },
    select: { id: true },
  });
}

/** Reemplaza el envío: guarda cada correo, o falla si se pide. */
function enviadorDePrueba(falla = false) {
  const enviados: MensajeCorreo[] = [];
  const enviar = async (mensaje: MensajeCorreo) => {
    if (falla) throw new Error("Envío de prueba fallido");
    enviados.push(mensaje);
  };
  return { enviados, enviar };
}

const correosPara = (enviados: MensajeCorreo[], correo: string) =>
  enviados.filter((mensaje) => mensaje.para === correo);

async function registrosDe(tx: Tx, empresaId: string) {
  const registros = await tx.avisoEnviado.findMany({
    where: { empresaId },
    select: { documentoId: true, fechaVencimiento: true, diasAnticipacion: true, estado: true, destinatario: true },
    orderBy: [{ fechaVencimiento: "asc" }, { diasAnticipacion: "asc" }],
  });
  return registros.map((registro) => ({ ...registro, fechaVencimiento: fechaDesdeBase(registro.fechaVencimiento) }));
}

describe("Avisos por correo en la base de datos", { skip: sinBase }, () => {
  test("CP-INT-24 · un correo por empresa con sus avisos del día, registrados como enviados", async () => {
    await sinGuardar(async (tx) => {
      const a = await crearEmpresa(tx, "Empresa A");
      const b = await crearEmpresa(tx, "Empresa B");
      const activo = await crearVehiculo(tx, a.id, "SIMA24");
      const inactivo = await crearVehiculo(tx, a.id, "SIMI24", "inactivo");
      const conductor = await crearConductor(tx, a.id);
      const soap = await crearDocumento(tx, a.id, 7, { vehiculoId: activo.id }, "soap");
      const licencia = await crearDocumento(tx, a.id, 0, { conductorId: conductor.id }, "licencia_conducir");
      await crearDocumento(tx, a.id, 31, { vehiculoId: activo.id }, "revision_tecnica");
      await crearDocumento(tx, a.id, -1, { vehiculoId: activo.id }, "permiso_circulacion");
      await crearDocumento(tx, a.id, 7, { vehiculoId: inactivo.id }, "soap");
      const deB = await crearVehiculo(tx, b.id, "SIMB24");
      await crearDocumento(tx, b.id, 1, { vehiculoId: deB.id }, "soap");

      const { enviados, enviar } = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });

      // Criterios 1, 2, 4, 6 y 7: un solo correo para A, con el SOAP (7 días) y la licencia (hoy).
      const deA = correosPara(enviados, a.correo);
      assert.equal(deA.length, 1);
      assert.equal(deA[0].asunto, "MicroLogist: documentos que vencen hoy");
      assert.match(deA[0].texto, /Licencia de conducir · Conductor de prueba · .* · Vence hoy/);
      assert.match(deA[0].texto, /SOAP · SIMA-24 · .* · Vence en 7 días/);
      assert.doesNotMatch(deA[0].texto, /SIMI-24|SIMB-24|Revisión técnica|Permiso de circulación/);
      assert.equal(correosPara(enviados, b.correo).length, 1);

      // Criterio 8: cada aviso queda registrado con su plazo, destinatario y estado.
      assert.deepEqual(await registrosDe(tx, a.id), [
        { documentoId: licencia.id, fechaVencimiento: HOY, diasAnticipacion: 0, estado: "enviado", destinatario: a.correo },
        { documentoId: soap.id, fechaVencimiento: sumarDias(HOY, 7), diasAnticipacion: 7, estado: "enviado", destinatario: a.correo },
      ]);
    });
  });

  test("CP-INT-25 · una segunda ejecución el mismo día no repite ningún aviso", async () => {
    await sinGuardar(async (tx) => {
      const a = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, a.id, "SIMA25");
      await crearDocumento(tx, a.id, 7, { vehiculoId: vehiculo.id });

      const primera = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar: primera.enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });
      assert.equal(correosPara(primera.enviados, a.correo).length, 1);

      const segunda = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar: segunda.enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });
      assert.equal(correosPara(segunda.enviados, a.correo).length, 0);
      assert.equal((await registrosDe(tx, a.id)).length, 1);
    });
  });

  test("CP-INT-26 · un envío fallido queda fallido y se reintenta al día siguiente, no el mismo día", async () => {
    await sinGuardar(async (tx) => {
      const a = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, a.id, "SIMA26");
      // Faltan 10 días: hoy y mañana toca el mismo aviso, el de 30.
      await crearDocumento(tx, a.id, 10, { vehiculoId: vehiculo.id });

      await procesarAvisos({ db: tx, enviar: enviadorDePrueba(true).enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });
      assert.deepEqual(
        (await registrosDe(tx, a.id)).map(({ diasAnticipacion, estado }) => [diasAnticipacion, estado]),
        [[30, "fallido"]],
      );

      const mismoDia = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar: mismoDia.enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });
      assert.equal(correosPara(mismoDia.enviados, a.correo).length, 0);

      const alDiaSiguiente = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar: alDiaSiguiente.enviar, ahora: MANANA, urlDocumentos: URL_DOCUMENTOS });
      const reintento = correosPara(alDiaSiguiente.enviados, a.correo);
      assert.equal(reintento.length, 1);
      assert.match(reintento[0].texto, /Vence en 9 días/);
      assert.deepEqual(
        (await registrosDe(tx, a.id)).map(({ diasAnticipacion, estado }) => [diasAnticipacion, estado]),
        [[30, "enviado"]],
      );
    });
  });

  test("CP-INT-27 · un documento renovado vuelve a recibir sus avisos", async () => {
    await sinGuardar(async (tx) => {
      const a = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, a.id, "SIMA27");
      const documento = await crearDocumento(tx, a.id, 7, { vehiculoId: vehiculo.id });
      await procesarAvisos({ db: tx, enviar: enviadorDePrueba().enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });

      // Renovar es editar la fecha (PB-13): ahora vence en 30 días.
      await tx.documento.update({
        where: { id: documento.id },
        data: { fechaVencimiento: fechaParaBase(sumarDias(HOY, 30)) },
      });
      const despues = enviadorDePrueba();
      await procesarAvisos({ db: tx, enviar: despues.enviar, ahora: AHORA, urlDocumentos: URL_DOCUMENTOS });

      assert.equal(correosPara(despues.enviados, a.correo).length, 1);
      assert.deepEqual(
        (await registrosDe(tx, a.id)).map(({ fechaVencimiento, diasAnticipacion }) => [fechaVencimiento, diasAnticipacion]),
        [
          [sumarDias(HOY, 7), 7],
          [sumarDias(HOY, 30), 30],
        ],
      );
    });
  });

  test("CP-INT-28 · la base impide registrar dos veces el mismo aviso o un plazo que no existe", async () => {
    const registrar = async (tx: Tx, diasAnticipacion: number, veces: number) => {
      const a = await crearEmpresa(tx, "Empresa A");
      const vehiculo = await crearVehiculo(tx, a.id, "SIMA28");
      const documento = await crearDocumento(tx, a.id, 7, { vehiculoId: vehiculo.id });
      for (let vez = 0; vez < veces; vez++) {
        await tx.avisoEnviado.create({
          data: {
            empresaId: a.id,
            documentoId: documento.id,
            fechaVencimiento: fechaParaBase(sumarDias(HOY, 7)),
            diasAnticipacion,
            destinatario: a.correo,
            estado: "enviado",
            enviadoEn: AHORA,
          },
        });
      }
    };

    // La restricción única (documento, fecha de vencimiento, plazo).
    await assert.rejects(
      prisma.$transaction((tx) => registrar(tx, 7, 2), { maxWait: 10_000, timeout: 30_000 }),
      (error) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002",
    );
    // La regla CHECK de los plazos: solo 30, 7, 1 y 0.
    await assert.rejects(
      prisma.$transaction((tx) => registrar(tx, 5, 1), { maxWait: 10_000, timeout: 30_000 }),
      /aviso_enviado_dias_anticipacion_check|check constraint/i,
    );
  });

  test("no quedan datos de estas pruebas en la base", async () => {
    assert.equal(await prisma.empresa.count({ where: { nombre: { contains: NOMBRE_DE_PRUEBA } } }), 0);
  });
});
