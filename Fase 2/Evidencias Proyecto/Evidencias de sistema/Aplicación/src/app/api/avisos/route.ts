import { esLlamadaAutorizada } from "@/lib/avisos";
import { procesarAvisos } from "@/lib/avisos-datos";
import { enviadorResend } from "@/lib/correo";

// Proceso diario de avisos por correo (JOA-13). Lo llama Vercel Cron todos los días a las 11:00
// UTC (vercel.json) con `Authorization: Bearer <CRON_SECRET>`. No usa la sesión: el proxy lo deja
// pasar (src/lib/acceso.ts) y esta ruta se protege con la clave. Responde solo los totales, sin
// correos ni nombres.

export async function GET(request: Request) {
  if (!esLlamadaAutorizada(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const resultado = await procesarAvisos({
      enviar: enviadorResend(),
      urlDocumentos: new URL("/documentos", request.url).toString(),
    });
    return Response.json(resultado);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "No se pudo completar el proceso de avisos." }, { status: 500 });
  }
}
