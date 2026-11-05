// Envío de correos con Resend (JOA-13, sección 2), usando su API HTTP con fetch: no necesita
// otra dependencia. La clave va en RESEND_API_KEY y el remitente en CORREO_REMITENTE.

export type MensajeCorreo = { para: string; asunto: string; texto: string; html: string };
export type EnviarCorreo = (mensaje: MensajeCorreo) => Promise<void>;

const API_RESEND = "https://api.resend.com/emails";

/**
 * Remitente de prueba de Resend. Sin dominio propio, el plan gratis solo envía desde aquí y a los
 * correos verificados en la cuenta (JOA-13, sección 5).
 */
export const REMITENTE_DE_PRUEBA = "MicroLogist <onboarding@resend.dev>";

/**
 * Devuelve la función que envía un correo. Lanza un error si falta la clave o si Resend no lo
 * acepta: el proceso de avisos lo registra como fallido y lo reintenta al día siguiente.
 */
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
    // Solo el código: el cuerpo de la respuesta puede traer datos del destinatario.
    if (!respuesta.ok) throw new Error(`Resend no aceptó el correo (HTTP ${respuesta.status}).`);
  };
}
