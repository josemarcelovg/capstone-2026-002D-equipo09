import { Prisma } from "@/generated/prisma/client";
import type { Conductor, DatosConductor } from "@/lib/conductores";
import { prisma } from "@/lib/prisma";
import { conductorDeLaEmpresa, filtroConductores } from "@/lib/conductores-filtros";
import { empresaDeLaSesion } from "@/lib/sesion";

// Acceso a datos de conductores. Igual que en vehículos, toda consulta filtra por la
// empresa de la sesión, también al buscar por id (JOA-09, sección 4): un conductor de
// otra empresa se trata igual que uno que no existe.

const CAMPOS = {
  id: true,
  nombre: true,
  rut: true,
  telefono: true,
  email: true,
  activo: true,
} satisfies Prisma.ConductorSelect;

// Un id con otro formato no existe; además, Postgres rechazaría la consulta.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** La empresa ya tiene ese RUT (restricción única empresa_id + rut). */
export class RutDuplicadoError extends Error {
  /** `true` si el conductor que ya tiene ese RUT está inactivo. */
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

/** Ordenados por nombre. La búsqueda y los inactivos se filtran en conductores-filtros.ts. */
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

/** Lanza `RutDuplicadoError` si la empresa ya tiene ese RUT. Siempre parte activo. */
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

/**
 * Devuelve `null` si el conductor no existe en la empresa de la sesión.
 * Lanza `RutDuplicadoError` si el RUT nuevo ya está en la empresa.
 */
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
