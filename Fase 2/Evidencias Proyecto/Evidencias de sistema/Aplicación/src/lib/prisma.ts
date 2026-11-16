import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Un solo cliente de Prisma para toda la app, para no abrir conexiones de más.

const almacen = globalThis as typeof globalThis & { prisma?: PrismaClient };

function crearCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = almacen.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") almacen.prisma = prisma;
