import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración de Prisma para migraciones, seed y studio. Las migraciones usan DIRECT_URL
// y están en la carpeta «Base de datos».

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
