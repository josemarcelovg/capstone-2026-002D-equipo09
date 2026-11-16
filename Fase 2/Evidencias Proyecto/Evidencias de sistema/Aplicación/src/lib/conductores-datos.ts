import { Prisma } from "@/generated/prisma/client";
import type { Conductor, DatosConductor } from "@/lib/conductores";
import { prisma } from "@/lib/prisma";
import { conductorDeLaEmpresa, filtroConductores } from "@/lib/conductores-filtros";
import { empresaDeLaSesion } from "@/lib/sesion";

// Lectura y guardado de conductores. Todas las consultas filtran por la empresa de la sesión.

const CAMPOS = {
  id: true,
  nombre: true,
  rut: true,
  telefono: true,
  email: true,
  activo: true,
} satisfies Prisma.ConductorSelect;

// Un id que no tiene formato UUID se trata como no encontrado.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RutDuplicadoError extends Error {
  // true si el conductor que ya tiene ese RUT está desactivado
  constructor(readonly inactivo: boolean) {
    super("RUT duplicado");
  }
}

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

async function duplicado(empresaId: string, rut: string) {
  const existente = await prisma.conductor.findUnique({
    where: { empresaId_rut: { empresaId, rut } },
    select: { activo: true },
  });
  return new RutDuplicadoError(existente ? !existente.activo : false);
}

export type FiltroConductores = {
  buscar?: string;
  incluirInactivos?: boolean;
};

export async function listarConductores(filtro: FiltroConductores = {}): Promise<Conductor[]> {
  const empresaId = await empresaDeLaSesion();
  return prisma.conductor.findMany({
    where: filtroConductores(empresaId, filtro),
    select: CAMPOS,
    orderBy: [{ nombre: "asc" }, { rut: "asc" }],
  });
}

export async function obtenerConductor(id: string): Promise<Conductor | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  return prisma.conductor.findFirst({ where: conductorDeLaEmpresa(id, empresaId), select: CAMPOS });
}

// Un conductor nuevo siempre parte activo.
export async function crearConductor(datos: DatosConductor): Promise<Conductor> {
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.conductor.create({
      data: { ...datos, activo: true, empresaId },
      select: CAMPOS,
    });
  } catch (error) {
    if (codigoPrisma(error) === "P2002") throw await duplicado(empresaId, datos.rut);
    throw error;
  }
}

// Desactiva al conductor y deja sin conductor a sus vehículos, todo junto en una transacción.
export async function desactivarConductor(id: string): Promise<{ vehiculosSinConductor: number } | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  try {
    const [, liberados] = await prisma.$transaction([
      prisma.conductor.update({
        where: conductorDeLaEmpresa(id, empresaId),
        data: { activo: false },
        select: { id: true },
      }),
      prisma.vehiculo.updateMany({ where: { empresaId, conductorId: id }, data: { conductorId: null } }),
    ]);
    return { vehiculosSinConductor: liberados.count };
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    throw error;
  }
}

// Devuelve null si el conductor no existe en la empresa.
export async function actualizarConductor(
  id: string,
  cambios: Partial<DatosConductor> & { activo?: boolean },
): Promise<Conductor | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.conductor.update({
      where: conductorDeLaEmpresa(id, empresaId),
      data: cambios,
      select: CAMPOS,
    });
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    if (codigoPrisma(error) === "P2002" && cambios.rut) {
      throw await duplicado(empresaId, cambios.rut);
    }
    throw error;
  }
}
