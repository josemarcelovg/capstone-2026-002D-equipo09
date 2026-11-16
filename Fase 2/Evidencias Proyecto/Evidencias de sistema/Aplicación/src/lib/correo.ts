// Envío de correos con la API de Resend.

export type MensajeCorreo = { para: string; asunto: string; texto: string; html: string };
export type EnviarCorreo = (mensaje: MensajeCorreo) => Promise<void>;

const API_RESEND = "https://api.resend.com/emails";

// Remitente de prueba de Resend, mientras no haya un dominio propio.
export const REMITENTE_DE_PRUEBA = "MicroLogist <onboarding@resend.dev>";

// Devuelve la función que manda el correo. Si falla, el aviso queda como fallido.
export function enviadorResend(
  entorno: { clave?: string; remitente?: string } = {
    clave: process.env.RESEND_API_KEY,
    remitente: process.env.CORREO_REMITENTE,
  },
  hacerSolicitud: typeof fetch = fetch,
): EnviarCorreo {
  return async (mensaje) => {
    const clave = entorno.clave?.trim();
    if (!clave) throw new Error("Falta RESEND_API_KEY: no se puede enviar el correo.");

    const respuesta = await hacerSolicitud(API_RESEND, {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: entorno.remitente?.trim() || REMITENTE_DE_PRUEBA,
        to: [mensaje.para],
        subject: mensaje.asunto,
        text: mensaje.texto,
        html: mensaje.html,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    // No se muestra la respuesta completa porque puede traer datos del destinatario.
    if (!respuesta.ok) throw new Error(`Resend no aceptó el correo (HTTP ${respuesta.status}).`);
  };
}
