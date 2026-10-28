import { Prisma } from "@/generated/prisma/client";
import type { DatosEmpresa } from "@/lib/empresa";
import { prisma } from "@/lib/prisma";
import { empresaDeLaSesion } from "@/lib/sesion";

// Datos de la empresa de la sesión (PB-14). Nunca se recibe un id: siempre es la empresa
// del usuario que inició sesión, así que no hay forma de ver o editar otra.

const CAMPOS = {
  nombre: true,
  emailContacto: true,
  telefono: true,
  rut: true,
} satisfies Prisma.EmpresaSelect;

/** Otra empresa ya tiene ese RUT (columna única en `empresa`). */
export class RutDeEmpresaDuplicadoError extends Error {}

export async function obtenerMiEmpresa(): Promise<DatosEmpresa | null> {
  const empresaId = await empresaDeLaSesion();
  return prisma.empresa.findUnique({ where: { id: empresaId }, select: CAMPOS });
}

/** Lanza `RutDeEmpresaDuplicadoError` si el RUT ya pertenece a otra empresa. */
export async function actualizarMiEmpresa(datos: DatosEmpresa): Promise<DatosEmpresa> {
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.empresa.update({ where: { id: empresaId }, data: datos, select: CAMPOS });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new RutDeEmpresaDuplicadoError();
    }
    throw error;
  }
}
