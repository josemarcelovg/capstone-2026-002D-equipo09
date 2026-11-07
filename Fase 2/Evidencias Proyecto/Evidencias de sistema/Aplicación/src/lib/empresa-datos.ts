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

/** El RUT se guardó entre que se abrió la página y se envió el formulario (otra pestaña). */
export class RutYaRegistradoError extends Error {}

export async function obtenerMiEmpresa(): Promise<DatosEmpresa | null> {
  const empresaId = await empresaDeLaSesion();
  return prisma.empresa.findUnique({ where: { id: empresaId }, select: CAMPOS });
}

/**
 * Lanza `RutDeEmpresaDuplicadoError` si el RUT ya pertenece a otra empresa, y
 * `RutYaRegistradoError` si la empresa ya tenía otro RUT guardado.
 */
export async function actualizarMiEmpresa(datos: DatosEmpresa): Promise<DatosEmpresa> {
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.empresa.update({
      // La regla "el RUT no se cambia" va en la misma consulta: solo se actualiza si la
      // empresa no tenía RUT o si es el mismo. Así dos envíos a la vez no lo pueden cambiar.
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
