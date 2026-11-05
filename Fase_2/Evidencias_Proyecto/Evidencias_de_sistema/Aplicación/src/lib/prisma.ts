import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Un solo PrismaClient por proceso: cada instancia abre su propio grupo de conexiones.
// La aplicación usa DATABASE_URL (transaction pooler de Supabase, puerto 6543).
// Se guarda en globalThis para que las recargas de `next dev` no abran conexiones nuevas.

const almacen = globalThis as typeof globalThis & { prisma?: PrismaClient };

function crearCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = almacen.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") almacen.prisma = prisma;
