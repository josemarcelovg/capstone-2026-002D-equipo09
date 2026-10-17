import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.44"],
  // Que `next dev` no agregue archivos de instrucciones en la raíz del proyecto.
  agentRules: false,
};

export default nextConfig;