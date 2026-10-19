import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { empresaDeLaSesion } from "@/lib/sesion";
import {
  normalizarPatente,
  type DatosVehiculo,
  type Estado,
  type Vehiculo,
} from "@/lib/vehiculos";

// Acceso a datos de vehículos. Toda consulta filtra por la empresa de la sesión,
// también al buscar por id (JOA-01, sección 2.4): un vehículo de otra empresa se
// trata igual que uno que no existe. Las pantallas y acciones solo usan estas funciones.

const CAMPOS = {
  id: true,
  patente: true,
  tipo: true,
  marca: true,
  modelo: true,
  anio: true,
  capacidadPasajeros: true,
  numeroInterno: true,
  color: true,
  estado: true,
  observaciones: true,
} satisfies Prisma.VehiculoSelect;

// Un id con otro formato no existe; además, Postgres rechazaría la consulta.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** La empresa ya tiene esa patente (restricción única empresa_id + patente). */
export class PatenteDuplicadaError extends Error {}

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

export type FiltroVehiculos = {
  patente?: string;
  estado?: Estado;
  incluirInactivos?: boolean;
};

/** Ordenados por patente. Sin `estado` no trae los inactivos, salvo que se pidan. */
export async function listarVehiculos({
  patente = "",
  estado,
  incluirInactivos = false,
}: FiltroVehiculos = {}): Promise<Vehiculo[]> {
  const empresaId = await empresaDeLaSesion();
  return prisma.vehiculo.findMany({
    where: {
      empresaId,
      patente: { contains: normalizarPatente(patente) },
      estado: estado ?? (incluirInactivos ? undefined : { not: "inactivo" }),
    },
    select: CAMPOS,
    orderBy: { patente: "asc" },
  });
}

export async function obtenerVehiculo(id: string): Promise<Vehiculo | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  return prisma.vehiculo.findFirst({ where: { id, empresaId }, select: CAMPOS });
}

/** Lanza `PatenteDuplicadaError` si la empresa ya tiene esa patente. */
export async function crearVehiculo(datos: DatosVehiculo): Promise<Vehiculo> {
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.vehiculo.create({ data: { ...datos, empresaId }, select: CAMPOS });
  } catch (error) {
    if (codigoPrisma(error) === "P2002") throw new PatenteDuplicadaError();
    throw error;
  }
}

/**
 * Devuelve `null` si el vehículo no existe en la empresa de la sesión.
 * Lanza `PatenteDuplicadaError` si la patente nueva ya está en la empresa.
 */
export async function actualizarVehiculo(
  id: string,
  cambios: Partial<DatosVehiculo>,
): Promise<Vehiculo | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  try {
    return await prisma.vehiculo.update({
      where: { id, empresaId },
      data: cambios,
      select: CAMPOS,
    });
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    if (codigoPrisma(error) === "P2002") throw new PatenteDuplicadaError();
    throw error;
  }
}
