import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración del CLI de Prisma (migraciones, seed, studio).
// Las migraciones usan DIRECT_URL (session pooler de Supabase, puerto 5432);
// la aplicación usa DATABASE_URL (transaction pooler, puerto 6543) en src/lib/prisma.ts.
// Se lee con process.env y no con env() para que `prisma generate` funcione
// sin base de datos (por ejemplo, en Vercel o en CI).

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
