import { Prisma } from "@/generated/prisma/client";
import type { DatosEmpresa } from "@/lib/empresa";
import { prisma } from "@/lib/prisma";
import { empresaDeLaSesion } from "@/lib/sesion";

// Datos de la empresa de la sesión. No recibe un id, así que solo se puede ver y editar la propia.

const CAMPOS = {
  nombre: true,
  emailContacto: true,
  telefono: true,
  rut: true,
} satisfies Prisma.EmpresaSelect;

// Otra empresa ya tiene ese RUT.
export class RutDeEmpresaDuplicadoError extends Error {}

// Se guardó un RUT desde otra pestaña mientras se editaba.
export class RutYaRegistradoError extends Error {}

export async function obtenerMiEmpresa(): Promise<DatosEmpresa | null> {
  const empresaId = await empresaDeLaSesion();
  return prisma.empresa.findUnique({ where: { id: empresaId }, select: CAMPOS });
}

export async function actualizarMiEmpresa(datos: DatosEmpresa): Promise<DatosEmpresa> {
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.empresa.update({
      // Solo se actualiza si la empresa no tenía RUT o si es el mismo.
      where: { id: empresaId, OR: [{ rut: null }, { rut: datos.rut }] },
      data: datos,
      select: CAMPOS,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new RutDeEmpresaDuplicadoError();
      if (error.code === "P2025") throw new RutYaRegistradoError();
    }
    throw error;
  }
}
