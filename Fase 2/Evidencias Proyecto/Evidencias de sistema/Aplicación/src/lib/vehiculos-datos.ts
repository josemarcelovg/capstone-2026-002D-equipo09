import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { empresaDeLaSesion } from "@/lib/sesion";
import {
  normalizarPatente,
  type DatosVehiculo,
  type Estado,
  type Vehiculo,
} from "@/lib/vehiculos";

// Lectura y guardado de vehículos. Todas las consultas filtran por la empresa de la sesión.

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

// Un id que no tiene formato UUID se trata como no encontrado.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PatenteDuplicadaError extends Error {}

export class ConductorNoValidoError extends Error {}

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

// Solo se pueden asignar conductores activos de la misma empresa.
async function comprobarConductor(empresaId: string, conductorId: string | null | undefined) {
  if (!conductorId) return;
  const conductor = await prisma.conductor.findFirst({
    where: { id: conductorId, empresaId, activo: true },
    select: { id: true },
  });
  if (!conductor) throw new ConductorNoValidoError();
}

// Pasa los errores de Prisma a errores propios con mensaje para el usuario.
function traducir(error: unknown) {
  if (codigoPrisma(error) === "P2002") return new PatenteDuplicadaError();
  if (codigoPrisma(error) === "P2003") return new ConductorNoValidoError();
  return error;
}

export type FiltroVehiculos = {
  patente?: string;
  estado?: Estado;
  incluirInactivos?: boolean;
};

// Ordenados por patente. Por defecto no muestra los inactivos.
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

export async function crearVehiculo(datos: DatosVehiculo): Promise<Vehiculo> {
  const empresaId = await empresaDeLaSesion();
  await comprobarConductor(empresaId, datos.conductorId);
  try {
    return await prisma.vehiculo.create({ data: { ...datos, empresaId }, select: CAMPOS });
  } catch (error) {
    throw traducir(error);
  }
}

// Devuelve null si el vehículo no existe en la empresa.
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

// Vehículos asignados a un conductor, para mostrarlos en su ficha.
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
