import { timingSafeEqual } from "node:crypto";
import { describirVencimiento, ETIQUETA_TIPO_DOCUMENTO, type TipoDocumento } from "./documentos.ts";
import { diasEntre, formatearFecha } from "./fechas.ts";

// Reglas de las alertas de vencimiento por correo (JOA-13), sin dependencias de Next.js ni de la
// base de datos para probarlas directo (tests/avisos.test.ts). El proceso que lee la base y envía
// los correos está en avisos-datos.ts; el envío, en correo.ts.
// Importa documentos.ts y fechas.ts con ruta relativa para que las pruebas los carguen sin Next.js.

/** Los 4 avisos de cada documento: 30, 7 y 1 días antes, y el día del vencimiento (JOA-13, sección 2). */
export const PLAZOS_AVISO = [30, 7, 1, 0] as const;
export type PlazoAviso = (typeof PLAZOS_AVISO)[number];

/**
 * El plazo que corresponde a los días que faltan (JOA-13, sección 3.1): el menor de 30, 7, 1 o 0
 * que sea mayor o igual. `null` si ya venció o si faltan más de 30 días. Así un plazo que no se
 * avisó a tiempo nunca se manda atrasado: faltando 5 días toca el de 7, que dice "Vence en 5 días".
 */
export function plazoQueCorresponde(dias: number): PlazoAviso | null {
  if (dias < 0 || dias > PLAZOS_AVISO[0]) return null;
  return [...PLAZOS_AVISO].reverse().find((plazo) => plazo >= dias) ?? null;
}

export type DocumentoParaAviso = {
  id: string;
  empresaId: string;
  tipo: TipoDocumento;
  descripcion: string | null;
  /** `AAAA-MM-DD`. */
  fechaVencimiento: string;
  /** Patente con guion o nombre del conductor. */
  dueno: string;
  duenoActivo: boolean;
};

export type AvisoRegistrado = {
  documentoId: string;
  /** `AAAA-MM-DD`: la fecha que tenía el documento al avisar. */
  fechaVencimiento: string;
  diasAnticipacion: number;
  estado: "enviado" | "fallido";
};

export type AvisoPendiente = {
  documento: DocumentoParaAviso;
  plazo: PlazoAviso;
  /** Días que faltan hoy, que son los que dice el correo. */
  dias: number;
};

const clave = (documentoId: string, fechaVencimiento: string, plazo: number) =>
  `${documentoId}|${fechaVencimiento}|${plazo}`;

/**
 * Los avisos que hay que mandar hoy (JOA-13, sección 3): uno por documento con el plazo que
 * corresponde, si su dueño está activo y ese aviso (documento + fecha de vencimiento + plazo) no
 * está registrado como enviado. Los fallidos se vuelven a incluir. Quedan ordenados por fecha de
 * vencimiento, como en el correo.
 */
export function avisosPendientes(
  documentos: DocumentoParaAviso[],
  registrados: AvisoRegistrado[],
  hoy: string,
): AvisoPendiente[] {
  const enviados = new Set(
    registrados
      .filter((registro) => registro.estado === "enviado")
      .map((registro) => clave(registro.documentoId, registro.fechaVencimiento, registro.diasAnticipacion)),
  );

  const pendientes: AvisoPendiente[] = [];
  for (const documento of documentos) {
    if (!documento.duenoActivo) continue;
    const dias = diasEntre(hoy, documento.fechaVencimiento);
    const plazo = plazoQueCorresponde(dias);
    if (plazo === null) continue;
    if (enviados.has(clave(documento.id, documento.fechaVencimiento, plazo))) continue;
    pendientes.push({ documento, plazo, dias });
  }
  return pendientes.sort(
    (a, b) =>
      a.documento.fechaVencimiento.localeCompare(b.documento.fechaVencimiento) ||
      a.documento.dueno.localeCompare(b.documento.dueno, "es"),
  );
}

/** Un solo correo por empresa con todos sus avisos del día (JOA-13, sección 2). */
export function agruparPorEmpresa(avisos: AvisoPendiente[]) {
  const porEmpresa = new Map<string, AvisoPendiente[]>();
  for (const aviso of avisos) {
    const lista = porEmpresa.get(aviso.documento.empresaId) ?? [];
    lista.push(aviso);
    porEmpresa.set(aviso.documento.empresaId, lista);
  }
  return porEmpresa;
}

// --- El correo (JOA-13, sección 4) ----------------------------------------------------------

export type Correo = { asunto: string; texto: string; html: string };

const NOTA_FINAL =
  "Este aviso se envía al correo de contacto de tu empresa. Puedes cambiarlo en los datos de tu empresa.";

/** "Revisión técnica" o, para el tipo "otro", su descripción ("Seguro de pasajeros"). */
function nombreDelDocumento(documento: DocumentoParaAviso) {
  if (documento.tipo === "otro" && documento.descripcion) return documento.descripcion;
  return ETIQUETA_TIPO_DOCUMENTO[documento.tipo];
}

/** El nombre de la empresa o del conductor viene de un formulario: no se interpreta como HTML. */
function escaparHtml(texto: string) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** "MicroLogist: 3 documentos por vencer" o, si alguno vence hoy, "MicroLogist: documentos que vencen hoy". */
export function asuntoDelCorreo(avisos: AvisoPendiente[]) {
  const venceHoy = avisos.some((aviso) => aviso.dias === 0);
  if (avisos.length === 1) {
    return venceHoy ? "MicroLogist: un documento vence hoy" : "MicroLogist: 1 documento por vencer";
  }
  return venceHoy
    ? "MicroLogist: documentos que vencen hoy"
    : `MicroLogist: ${avisos.length} documentos por vencer`;
}

/**
 * El correo diario de una empresa: saludo, la lista de documentos (tipo, dueño, fecha y cuánto
 * falta), el enlace a los documentos y la nota del destinatario. Texto simple y un HTML sin
 * imágenes con lo mismo (RNF-COM-05).
 */
export function armarCorreo(
  empresa: { nombre: string },
  avisos: AvisoPendiente[],
  hoy: string,
  urlDocumentos: string,
): Correo {
  const nombreEmpresa = empresa.nombre.trim();
  const lineas = avisos.map(({ documento }) => ({
    documento: nombreDelDocumento(documento),
    dueno: documento.dueno,
    vence: formatearFecha(documento.fechaVencimiento),
    falta: describirVencimiento(documento.fechaVencimiento, hoy),
  }));

  const texto = [
    `Hola, ${nombreEmpresa}:`,
    "",
    "Estos documentos necesitan tu atención:",
    "",
    ...lineas.map((l) => `- ${l.documento} · ${l.dueno} · vence el ${l.vence} · ${l.falta}`),
    "",
    `Ver documentos: ${urlDocumentos}`,
    "",
    NOTA_FINAL,
  ].join("\n");

  const html = [
    `<p>Hola, ${escaparHtml(nombreEmpresa)}:</p>`,
    "<p>Estos documentos necesitan tu atención:</p>",
    "<ul>",
    ...lineas.map(
      (l) =>
        `<li><strong>${escaparHtml(l.documento)}</strong> · ${escaparHtml(l.dueno)} · ` +
        `vence el ${l.vence} · ${l.falta === "Vence hoy" ? "<strong>Vence hoy</strong>" : l.falta}</li>`,
    ),
    "</ul>",
    `<p><a href="${escaparHtml(urlDocumentos)}">Ver documentos</a></p>`,
    `<p>${NOTA_FINAL}</p>`,
  ].join("\n");

  return { asunto: asuntoDelCorreo(avisos), texto, html };
}

// --- La ruta del proceso ----------------------------------------------------------------------

/**
 * Vercel Cron llama la ruta del proceso con `Authorization: Bearer <CRON_SECRET>` (JOA-13,
 * sección 5). Sin `CRON_SECRET` configurado nunca se autoriza, para no dejar la ruta abierta.
 * La comparación toma el mismo tiempo aunque la clave sea parecida.
 */
export function esLlamadaAutorizada(encabezado: string | null, secreto: string | undefined) {
  const esperado = secreto?.trim();
  if (!esperado || !encabezado) return false;
  const recibido = Buffer.from(encabezado);
  const correcto = Buffer.from(`Bearer ${esperado}`);
  return recibido.length === correcto.length && timingSafeEqual(recibido, correcto);
}
