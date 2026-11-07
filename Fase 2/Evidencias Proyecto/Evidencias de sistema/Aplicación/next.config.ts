import type { NextConfig } from "next";
import { ENCABEZADOS_DE_SEGURIDAD } from "./src/lib/seguridad.ts";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.44"],
  // Que `next dev` no agregue archivos de instrucciones en la raíz del proyecto.
  agentRules: false,
  // No anunciar en cada respuesta que la aplicación usa Next.js.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: ENCABEZADOS_DE_SEGURIDAD }];
  },
};

export default nextConfig;