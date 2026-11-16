import { esLlamadaAutorizada, urlDeDocumentos } from "@/lib/avisos";
import { procesarAvisos } from "@/lib/avisos-datos";
import { enviadorResend } from "@/lib/correo";
import { prisma } from "@/lib/prisma";

// Ruta que llama Vercel Cron todos los días para mandar los avisos por correo.
// Se protege con CRON_SECRET y solo responde los totales.

export async function GET(request: Request) {
  if (!esLlamadaAutorizada(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const resultado = await procesarAvisos({
      db: prisma,
      enviar: enviadorResend(),
      urlDocumentos: urlDeDocumentos(process.env.URL_PUBLICA, request.url),
    });
    return Response.json(resultado);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "No se pudo completar el proceso de avisos." }, { status: 500 });
  }
}
