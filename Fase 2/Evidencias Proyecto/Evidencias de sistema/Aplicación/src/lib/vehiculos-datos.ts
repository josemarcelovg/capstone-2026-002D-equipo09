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
  conductorId: true,
} satisfies Prisma.VehiculoSelect;

// Un id con otro formato no existe; además, Postgres rechazaría la consulta.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** La empresa ya tiene esa patente (restricción única empresa_id + patente). */
export class PatenteDuplicadaError extends Error {}

/** El conductor elegido no es un conductor activo de la empresa (PB-24, criterio 2). */
export class ConductorNoValidoError extends Error {}

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

/**
 * Solo se asignan conductores activos de la empresa de la sesión. La clave foránea compuesta
 * (conductor_id, empresa_id) impide además uno de otra empresa, aunque esto fallara.
 */
async function comprobarConductor(empresaId: string, conductorId: string | null | undefined) {
  if (!conductorId) return;
  const conductor = await prisma.conductor.findFirst({
    where: { id: conductorId, empresaId, activo: true },
    select: { id: true },
  });
  if (!conductor) throw new ConductorNoValidoError();
}

/** Un error de Prisma conocido, traducido a los errores de este módulo. */
function traducir(error: unknown) {
  if (codigoPrisma(error) === "P2002") return new PatenteDuplicadaError();
  // Clave foránea: el conductor no existe en la empresa.
  if (codigoPrisma(error) === "P2003") return new ConductorNoValidoError();
  return error;
}

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

/**
 * Lanza `PatenteDuplicadaError` si la empresa ya tiene esa patente y `ConductorNoValidoError`
 * si el conductor asignado no es un conductor activo de la empresa.
 */
export async function crearVehiculo(datos: DatosVehiculo): Promise<Vehiculo> {
  const empresaId = await empresaDeLaSesion();
  await comprobarConductor(empresaId, datos.conductorId);
  try {
    return await prisma.vehiculo.create({ data: { ...datos, empresaId }, select: CAMPOS });
  } catch (error) {
    throw traducir(error);
  }
}

/**
 * Devuelve `null` si el vehículo no existe en la empresa de la sesión.
 * Lanza `PatenteDuplicadaError` si la patente nueva ya está en la empresa y
 * `ConductorNoValidoError` si el conductor asignado no es un conductor activo de la empresa.
 */
export async function actualizarVehiculo(
  id: string,
  cambios: Partial<DatosVehiculo>,
): Promise<Vehiculo | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  await comprobarConductor(empresaId, cambios.conductorId);
  try {
    return await prisma.vehiculo.update({
      where: { id, empresaId },
      data: cambios,
      select: CAMPOS,
    });
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    throw traducir(error);
  }
}

/** Los vehículos de los que el conductor es el conductor habitual, para su ficha (PB-24). */
export async function vehiculosDelConductor(
  conductorId: string,
): Promise<Pick<Vehiculo, "id" | "patente" | "estado">[]> {
  if (!UUID.test(conductorId)) return [];
  const empresaId = await empresaDeLaSesion();
  return prisma.vehiculo.findMany({
    where: { empresaId, conductorId },
    select: { id: true, patente: true, estado: true },
    orderBy: { patente: "asc" },
  });
}
