import type { Prisma } from "../generated/prisma/client.ts";
import {
  agruparPorEmpresa,
  armarCorreo,
  avisosPendientes,
  PLAZOS_AVISO,
  type AvisoPendiente,
  type DocumentoParaAviso,
} from "./avisos.ts";
import type { EnviarCorreo, MensajeCorreo } from "./correo.ts";
import { fechaDesdeBase, fechaParaBase, hoyEnChile, sumarDias } from "./fechas.ts";
import { formatearPatente } from "./vehiculos.ts";

// Proceso diario de avisos por correo (JOA-13, sección 3). Lo ejecuta la ruta /api/avisos, que
// llama Vercel Cron. Recibe la base de datos y la función de envío para poder probarlo dentro de
// una transacción que se deshace y sin mandar correos reales (tests/integracion/avisos.test.ts).
// Por eso importa con rutas relativas y no usa src/lib/prisma.ts: la ruta le pasa el cliente.
//
// No filtra por empresa: recorre los documentos de todas, pero arma un correo por empresa con
// solo sus documentos y lo manda a su correo de contacto (criterio 7 de JOA-13).

type BaseDeDatos = Pick<Prisma.TransactionClient, "documento" | "avisoEnviado">;

type Registro = {
  id: string;
  documentoId: string;
  fechaVencimiento: Date;
  diasAnticipacion: number;
  estado: "enviado" | "fallido";
  enviadoEn: Date;
};

export type ResultadoAvisos = {
  /** La fecha de hoy en Chile que usó el proceso. */
  hoy: string;
  /** Correos que se intentaron enviar: como máximo uno por empresa. */
  correos: number;
  /** Avisos que quedaron enviados. */
  enviados: number;
  /** Avisos que quedaron fallidos y se reintentan al día siguiente. */
  fallidos: number;
};

/**
 * Busca los documentos con aviso hoy, registra cada aviso, envía un correo por empresa y marca
 * cada aviso como enviado o fallido. Se puede ejecutar varias veces el mismo día sin repetir
 * avisos (criterio 9 de JOA-13).
 */
export async function procesarAvisos({
  db,
  enviar,
  urlDocumentos,
  ahora = new Date(),
}: {
  db: BaseDeDatos;
  enviar: EnviarCorreo;
  urlDocumentos: string;
  ahora?: Date;
}): Promise<ResultadoAvisos> {
  const hoy = hoyEnChile(ahora);
  const resultado: ResultadoAvisos = { hoy, correos: 0, enviados: 0, fallidos: 0 };

  // Solo los que vencen de hoy a 30 días: los demás no tienen aviso (JOA-13, sección 3.1).
  const documentos = await db.documento.findMany({
    where: {
      fechaVencimiento: {
        gte: fechaParaBase(hoy),
        lte: fechaParaBase(sumarDias(hoy, PLAZOS_AVISO[0])),
      },
    },
    select: {
      id: true,
      empresaId: true,
      tipo: true,
      descripcion: true,
      fechaVencimiento: true,
      vehiculo: { select: { patente: true, estado: true } },
      conductor: { select: { nombre: true, activo: true } },
      empresa: { select: { nombre: true, emailContacto: true } },
    },
  });
  if (documentos.length === 0) return resultado;

  const registrados: Registro[] = await db.avisoEnviado.findMany({
    where: { documentoId: { in: documentos.map((documento) => documento.id) } },
    select: {
      id: true,
      documentoId: true,
      fechaVencimiento: true,
      diasAnticipacion: true,
      estado: true,
      enviadoEn: true,
    },
  });

  const paraAviso: DocumentoParaAviso[] = documentos.map((documento) => ({
    id: documento.id,
    empresaId: documento.empresaId,
    tipo: documento.tipo,
    descripcion: documento.descripcion,
    fechaVencimiento: fechaDesdeBase(documento.fechaVencimiento),
    dueno: documento.vehiculo
      ? formatearPatente(documento.vehiculo.patente)
      : (documento.conductor?.nombre ?? ""),
    // Un vehículo en mantención sigue recibiendo avisos; uno inactivo, no (JOA-13, sección 2).
    duenoActivo: documento.vehiculo
      ? documento.vehiculo.estado !== "inactivo"
      : Boolean(documento.conductor?.activo),
  }));

  const pendientes = avisosPendientes(
    paraAviso,
    registrados.map((registro) => ({
      documentoId: registro.documentoId,
      fechaVencimiento: fechaDesdeBase(registro.fechaVencimiento),
      diasAnticipacion: registro.diasAnticipacion,
      estado: registro.estado,
    })),
    hoy,
  );

  const empresas = new Map(documentos.map((documento) => [documento.empresaId, documento.empresa]));

  for (const [empresaId, avisos] of agruparPorEmpresa(pendientes)) {
    const empresa = empresas.get(empresaId);
    if (!empresa) continue;
    const destinatario = empresa.emailContacto.trim().toLowerCase();

    // Primero se registra cada aviso; después se envía el correo (JOA-13, sección 3.3).
    const reservados: { aviso: AvisoPendiente; id: string }[] = [];
    for (const aviso of avisos) {
      const id = await reservar(db, aviso, destinatario, ahora, hoy, registrados);
      if (id) reservados.push({ aviso, id });
    }
    if (reservados.length === 0) continue;

    const ids = reservados.map(({ id }) => id);
    const correo = armarCorreo(
      empresa,
      reservados.map(({ aviso }) => aviso),
      hoy,
      urlDocumentos,
    );
    resultado.correos++;
    try {
      await enviarConReintento(enviar, { para: destinatario, ...correo });
    } catch (error) {
      // Falló también el reintento: quedan como fallidos y se reintentan al día siguiente
      // (JOA-13, sección 2).
      console.error(`No se pudo enviar el correo de avisos de la empresa ${empresaId}.`, error);
      resultado.fallidos += ids.length;
      continue;
    }
    await db.avisoEnviado.updateMany({
      where: { id: { in: ids } },
      data: { estado: "enviado", enviadoEn: new Date() },
    });
    resultado.enviados += ids.length;
  }

  return resultado;
}

/**
 * Envía el correo y, si falla, lo intenta una vez más de inmediato (JOA-13, sección 2). Sin este
 * reintento, un aviso de "vence hoy" que falla se perdería: al día siguiente el documento ya
 * venció y no le corresponde ningún plazo. Si el segundo intento también falla, lanza su error.
 */
async function enviarConReintento(enviar: EnviarCorreo, mensaje: MensajeCorreo) {
  try {
    await enviar(mensaje);
  } catch (error) {
    // Sin el correo del destinatario en el registro, igual que el error de más arriba.
    console.warn("Falló el envío del correo de avisos; se intenta una vez más.", error);
    await enviar(mensaje);
  }
}

/**
 * Registra el aviso como fallido antes de enviarlo, para que dos ejecuciones no lo manden dos
 * veces (JOA-13, sección 3.3): la restricción única deja pasar solo a una. Devuelve el id del
 * registro, o `null` si otra ejecución ya lo tomó. Un aviso fallido se reintenta solo si su
 * último intento fue un día anterior.
 */
async function reservar(
  db: BaseDeDatos,
  { documento, plazo }: AvisoPendiente,
  destinatario: string,
  ahora: Date,
  hoy: string,
  registrados: Registro[],
) {
  const anterior = registrados.find(
    (registro) =>
      registro.documentoId === documento.id &&
      fechaDesdeBase(registro.fechaVencimiento) === documento.fechaVencimiento &&
      registro.diasAnticipacion === plazo,
  );

  if (!anterior) {
    try {
      const creado = await db.avisoEnviado.create({
        data: {
          empresaId: documento.empresaId,
          documentoId: documento.id,
          fechaVencimiento: fechaParaBase(documento.fechaVencimiento),
          diasAnticipacion: plazo,
          destinatario,
          estado: "fallido",
          enviadoEn: ahora,
        },
        select: { id: true },
      });
      return creado.id;
    } catch (error) {
      // P2002: la restricción única ya tiene ese aviso, así que otra ejecución lo tomó.
      if ((error as { code?: unknown } | null)?.code === "P2002") return null;
      throw error;
    }
  }

  // Si ya se intentó hoy, se reintenta mañana. La condición sobre `enviadoEn` hace que, si dos
  // ejecuciones reintentan a la vez, solo una lo tome.
  if (anterior.estado === "enviado" || hoyEnChile(anterior.enviadoEn) >= hoy) return null;
  const { count } = await db.avisoEnviado.updateMany({
    where: { id: anterior.id, estado: "fallido", enviadoEn: anterior.enviadoEn },
    data: { destinatario, enviadoEn: ahora },
  });
  return count === 1 ? anterior.id : null;
}
