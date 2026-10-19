import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración del CLI de Prisma (migraciones, seed, studio).
// Las migraciones usan DIRECT_URL (session pooler de Supabase, puerto 5432);
// la aplicación usa DATABASE_URL (transaction pooler, puerto 6543) en src/lib/prisma.ts.
// Se lee con process.env y no con env() para que `prisma generate` funcione
// sin base de datos (por ejemplo, en Vercel o en CI).
//
// El esquema y las migraciones están en la carpeta «Base de datos», al lado de
// esta («Evidencias de sistema»). Los datos de prueba (seed) quedan aquí porque
// usan el cliente generado y las dependencias de la aplicación.

export default defineConfig({
  schema: "../Base de datos/schema.prisma",
  migrations: {
    path: "../Base de datos/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
