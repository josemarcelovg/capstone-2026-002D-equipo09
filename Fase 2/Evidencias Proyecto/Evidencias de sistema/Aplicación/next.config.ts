import type { NextConfig } from "next";
import { ENCABEZADOS_DE_SEGURIDAD } from "./src/lib/seguridad.ts";

// Otras direcciones desde las que se abre `next dev`, por ejemplo la IP del computador para
// probar desde un celular en la misma red. Opcional, en el .env y separadas por coma
// (ORIGENES_DESARROLLO=192.168.1.44). Solo afecta a `next dev`.
const origenesDeDesarrollo = (process.env.ORIGENES_DESARROLLO ?? "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: origenesDeDesarrollo,
  // Que `next dev` no agregue archivos de instrucciones en la raíz del proyecto.
  agentRules: false,
  // No anunciar en cada respuesta que la aplicación usa Next.js.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: ENCABEZADOS_DE_SEGURIDAD }];
  },
};

export default nextConfig;