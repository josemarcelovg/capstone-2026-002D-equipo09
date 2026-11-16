import { timingSafeEqual } from "node:crypto";
import { describirVencimiento, ETIQUETA_TIPO_DOCUMENTO, type TipoDocumento } from "./documentos.ts";
import { diasEntre, formatearFecha } from "./fechas.ts";

// Reglas de los avisos por correo: qué documentos avisar hoy y cómo se arma el correo.

// Días antes del vencimiento en que se manda un aviso.
export const PLAZOS_AVISO = [30, 7, 1, 0] as const;
export type PlazoAviso = (typeof PLAZOS_AVISO)[number];

// Qué aviso toca según los días que faltan. Si se saltó uno, se manda el siguiente.
export function plazoQueCorresponde(dias: number): PlazoAviso | null {
  if (dias < 0 || dias > PLAZOS_AVISO[0]) return null;
  return [...PLAZOS_AVISO].reverse().find((plazo) => plazo >= dias) ?? null;
}

export type DocumentoParaAviso = {
  id: string;
  empresaId: string;
  tipo: TipoDocumento;
  descripcion: string | null;
  // Formato AAAA-MM-DD
  fechaVencimiento: string;
  // Patente o nombre del conductor
  dueno: string;
  duenoActivo: boolean;
};

export type AvisoRegistrado = {
  documentoId: string;
  fechaVencimiento: string;
  diasAnticipacion: number;
  estado: "enviado" | "fallido";
};

export type AvisoPendiente = {
  documento: DocumentoParaAviso;
  plazo: PlazoAviso;
  dias: number;
};

const clave = (documentoId: string, fechaVencimiento: string, plazo: number) =>
  `${documentoId}|${fechaVencimiento}|${plazo}`;

// Los avisos que hay que mandar hoy, sin repetir los que ya se enviaron.
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

// Junta los avisos de cada empresa para mandarle un solo correo.
export function agruparPorEmpresa(avisos: AvisoPendiente[]) {
  const porEmpresa = new Map<string, AvisoPendiente[]>();
  for (const aviso of avisos) {
    const lista = porEmpresa.get(aviso.documento.empresaId) ?? [];
    lista.push(aviso);
    porEmpresa.set(aviso.documento.empresaId, lista);
  }
  return porEmpresa;
}

export type Correo = { asunto: string; texto: string; html: string };

const NOTA_FINAL =
  "Este aviso se envía al correo de contacto de tu empresa. Puedes cambiarlo en los datos de tu empresa.";

function nombreDelDocumento(documento: DocumentoParaAviso) {
  if (documento.tipo === "otro" && documento.descripcion) return documento.descripcion;
  return ETIQUETA_TIPO_DOCUMENTO[documento.tipo];
}

// Evita que un nombre escrito en un formulario se lea como HTML.
function escaparHtml(texto: string) {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Asunto del correo, por ejemplo "MicroLogist: 3 documentos por vencer".
export function asuntoDelCorreo(avisos: AvisoPendiente[]) {
  const venceHoy = avisos.some((aviso) => aviso.dias === 0);
  if (avisos.length === 1) {
    return venceHoy ? "MicroLogist: un documento vence hoy" : "MicroLogist: 1 documento por vencer";
  }
  return venceHoy
    ? "MicroLogist: documentos que vencen hoy"
    : `MicroLogist: ${avisos.length} documentos por vencer`;
}

// Arma el correo de una empresa, en texto simple y en HTML.
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

// El HTML usa tablas y estilos en línea para que se vea bien en Outlook, Gmail y el celular.

// Color de cada documento según cuánto falta: rojo, amarillo o naranja.
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
    // Texto de vista previa en la bandeja de entrada.
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

// Revisa que la llamada traiga la clave CRON_SECRET. Si la clave no está configurada, no deja pasar a nadie.
export function esLlamadaAutorizada(encabezado: string | null, secreto: string | undefined) {
  const esperado = secreto?.trim();
  if (!esperado || !encabezado) return false;
  const recibido = Buffer.from(encabezado);
  const correcto = Buffer.from(`Bearer ${esperado}`);
  return recibido.length === correcto.length && timingSafeEqual(recibido, correcto);
}

// Enlace del botón "Ver documentos". Usa URL_PUBLICA si está bien escrita.
export function urlDeDocumentos(urlPublica: string | undefined, urlSolicitud: string) {
  const base = urlPublica?.trim();
  if (base) {
    try {
      const url = new URL(base);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return new URL("/documentos", url).toString();
      }
    } catch {
      // Si no es válida, se usa la dirección de la solicitud.
    }
  }
  return new URL("/documentos", urlSolicitud).toString();
}
