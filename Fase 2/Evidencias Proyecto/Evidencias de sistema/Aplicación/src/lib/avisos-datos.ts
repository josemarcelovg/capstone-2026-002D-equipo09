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

// Proceso diario de avisos: busca los documentos por vencer, manda un correo por empresa
// y anota cada aviso para no repetirlo. Recibe la base y la función de envío para poder probarlo.

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
  hoy: string;
  // Como máximo uno por empresa
  correos: number;
  enviados: number;
  // Se reintentan al día siguiente
  fallidos: number;
};

// Se puede ejecutar varias veces el mismo día sin mandar avisos repetidos.
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

  // Solo los que vencen en los próximos 30 días.
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
    // Un vehículo en mantención sigue recibiendo avisos; uno inactivo, no.
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

    // Primero se anota cada aviso y después se manda el correo.
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
      // Si falla también el reintento, quedan como fallidos para mañana.
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

// Si el envío falla, lo intenta una vez más de inmediato, para no perder el aviso de "vence hoy".
async function enviarConReintento(enviar: EnviarCorreo, mensaje: MensajeCorreo) {
  try {
    await enviar(mensaje);
  } catch (error) {
    // No se registra el correo del destinatario.
    console.warn("Falló el envío del correo de avisos; se intenta una vez más.", error);
    await enviar(mensaje);
  }
}

// Anota el aviso antes de enviarlo, para que dos ejecuciones al mismo tiempo no lo manden dos veces.
// Devuelve null si otra ejecución ya lo tomó.
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
      // Otra ejecución ya anotó este aviso.
      if ((error as { code?: unknown } | null)?.code === "P2002") return null;
      throw error;
    }
  }

  // Un aviso fallido se reintenta recién al día siguiente.
  if (anterior.estado === "enviado" || hoyEnChile(anterior.enviadoEn) >= hoy) return null;
  const { count } = await db.avisoEnviado.updateMany({
    where: { id: anterior.id, estado: "fallido", enviadoEn: anterior.enviadoEn },
    data: { destinatario, enviadoEn: ahora },
  });
  return count === 1 ? anterior.id : null;
}
