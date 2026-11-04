import type { NextConfig } from "next";
import { ENCABEZADOS_DE_SEGURIDAD } from "./src/lib/seguridad.ts";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.44"],
  // Vercel construye desde la raíz del repositorio y arma el nombre de cada función
  // con la ruta hasta esta carpeta, que tiene espacios ("Fase 2/…") y Vercel rechaza.
  // En ejecución no se necesita nada de fuera de esta carpeta (SIM-10). `next build`
  // se ejecuta siempre desde aquí, en local y en Vercel (Root Directory).
  outputFileTracingRoot: process.cwd(),
  // Que `next dev` no agregue archivos de instrucciones en la raíz del proyecto.
  agentRules: false,
  // No anunciar en cada respuesta que la aplicación usa Next.js.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: ENCABEZADOS_DE_SEGURIDAD }];
  },
};

export default nextConfig;