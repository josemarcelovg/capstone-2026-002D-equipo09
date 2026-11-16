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

  const asunto = asuntoDelCorreo(avisos);
  // El título repite el asunto sin "MicroLogist: " y con mayúscula: "Un documento vence hoy".
  const resumen = asunto.replace(/^MicroLogist: /, "");
  const filas = avisos.map(({ dias }, i) => filaDelCorreo(lineas[i], colorDelPlazo(dias), i === 0));
  const html = plantillaDelCorreo({
    titulo: resumen.charAt(0).toUpperCase() + resumen.slice(1),
    saludo: `Hola, ${escaparHtml(nombreEmpresa)}:`,
    filas: filas.join("\n"),
    urlDocumentos: escaparHtml(urlDocumentos),
  });

  return { asunto, texto, html };
}

// El HTML usa tablas y estilos en cada etiqueta, sin imágenes ni hojas de estilo, porque es lo
// que muestran igual Outlook, Gmail y los celulares (RNF-COM-05). Mismos colores que la app.

/** Rojo si vence hoy, amarillo si vence en 7 días o menos, naranja si falta más. */
function colorDelPlazo(dias: number) {
  if (dias === 0) return { barra: "#ef4444", fondo: "#fee2e2", texto: "#991b1b" };
  if (dias <= 7) return { barra: "#f59e0b", fondo: "#fef3c7", texto: "#92400e" };
  return { barra: "#fb923c", fondo: "#ffedd5", texto: "#9a3412" };
}

function filaDelCorreo(
  l: { documento: string; dueno: string; vence: string; falta: string },
  color: { barra: string; fondo: string; texto: string },
  primera: boolean,
) {
  const borde = primera ? "" : "border-top:1px solid #f0efee;";
  return (
    `<tr><td style="${borde}border-left:4px solid ${color.barra};padding:12px 14px;">` +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1c1917;">' +
    `<strong>${escaparHtml(l.documento)}</strong> · ${escaparHtml(l.dueno)}` +
    `<div style="font-size:12px;color:#78716c;margin-top:2px;">Vence el ${l.vence}</div></td>` +
    '<td align="right" style="white-space:nowrap;padding-left:10px;">' +
    `<span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;` +
    `color:${color.texto};background:${color.fondo};border-radius:999px;padding:4px 10px;">${l.falta}</span>` +
    "</td></tr></table></td></tr>"
  );
}

function plantillaDelCorreo(partes: { titulo: string; saludo: string; filas: string; urlDocumentos: string }) {
  const fuente = "font-family:Arial,Helvetica,sans-serif;";
  return [
    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1"></head>',
    '<body style="margin:0;padding:0;background:#f5f5f4;">',
    // Texto que se ve en la vista previa de la bandeja de entrada.
    `<div style="display:none;max-height:0;overflow:hidden;">${partes.titulo}: estos documentos necesitan tu atención.</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;">',
    '<tr><td align="center" style="padding:24px 12px;">',
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" ' +
      'style="width:100%;max-width:560px;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;">',
    '<tr><td style="height:6px;background:#ea580c;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>',
    `<tr><td style="padding:20px 28px 0;${fuente}font-size:18px;font-weight:bold;color:#1c1917;">` +
      '<span style="color:#ea580c;">&#9679;</span> MicroLogist</td></tr>',
    `<tr><td style="padding:14px 28px 0;${fuente}font-size:22px;font-weight:bold;color:#1c1917;">${partes.titulo}</td></tr>`,
    `<tr><td style="padding:8px 28px 0;${fuente}font-size:14px;line-height:21px;color:#57534e;">` +
      `${partes.saludo} estos documentos necesitan tu atención para que tu flota siga operando sin problemas.</td></tr>`,
    '<tr><td style="padding:18px 28px 0;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e7e5e4;border-radius:10px;">',
    partes.filas,
    "</table></td></tr>",
    '<tr><td style="padding:22px 28px 26px;">',
    `<a href="${partes.urlDocumentos}" style="display:inline-block;background:#c2410c;color:#ffffff;${fuente}` +
      'font-size:14px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px;">Ver documentos</a>',
    "</td></tr>",
    `<tr><td style="background:#fafaf9;border-top:1px solid #e7e5e4;border-radius:0 0 12px 12px;padding:14px 28px;` +
      `${fuente}font-size:12px;line-height:18px;color:#78716c;">${NOTA_FINAL}</td></tr>`,
    "</table></td></tr></table></body></html>",
  ].join("\n");
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

/**
 * El enlace "Ver documentos" del correo. Usa la dirección pública de la aplicación
 * (`URL_PUBLICA`, por ejemplo `https://micrologist-equipo09.vercel.app`) para que el enlace no
 * dependa de cómo llegó la solicitud del cron. Si no está o no es una dirección http(s) válida,
 * usa la de la solicitud, como antes.
 */
export function urlDeDocumentos(urlPublica: string | undefined, urlSolicitud: string) {
  const base = urlPublica?.trim();
  if (base) {
    try {
      const url = new URL(base);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return new URL("/documentos", url).toString();
      }
    } catch {
      // No es una dirección válida: se usa la de la solicitud.
    }
  }
  return new URL("/documentos", urlSolicitud).toString();
}
