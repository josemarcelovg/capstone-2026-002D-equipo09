import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración del CLI de Prisma (migraciones, seed, studio).
// Las migraciones usan DIRECT_URL (session pooler de Supabase, puerto 5432);
// la aplicación usa DATABASE_URL (transaction pooler, puerto 6543) en src/lib/prisma.ts.
// Se lee con process.env y no con env() para que `prisma generate` funcione
// sin base de datos (por ejemplo, en Vercel o en CI).
//
// El esquema está en prisma/, junto al seed, para que `prisma generate` no necesite
// archivos de fuera de esta carpeta (Vercel construye solo con el Root Directory;
// SIM-10). Las migraciones
// siguen en la carpeta «Base de datos», al lado de esta («Evidencias_de_sistema»):
// solo se usan al aplicarlas desde un computador o desde Docker.

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "../Base de datos/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
