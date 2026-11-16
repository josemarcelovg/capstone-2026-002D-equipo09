import type { NextConfig } from "next";
import { ENCABEZADOS_DE_SEGURIDAD } from "./src/lib/seguridad.ts";

// Otras direcciones para abrir `next dev`, por ejemplo la IP del computador para probar desde el celular.
const origenesDeDesarrollo = (process.env.ORIGENES_DESARROLLO ?? "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: origenesDeDesarrollo,
  // Que `next dev` no cree archivos extra en la carpeta del proyecto.
  agentRules: false,
  // No mostrar en las respuestas que la app usa Next.js.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: ENCABEZADOS_DE_SEGURIDAD }];
  },
};

export default nextConfig;