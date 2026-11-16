import type { Prisma } from "../generated/prisma/client.ts";
import {
  rangoDeEstado,
  type DuenoDocumento,
  type EstadoDocumento,
  type TipoDocumento,
} from "./documentos.ts";
import { fechaParaBase } from "./fechas.ts";

// Filtros de las consultas de documentos. Están aparte para que el listado, el proceso de
// avisos y las pruebas usen los mismos.

export function documentoDeLaEmpresa(id: string, empresaId: string) {
  return { id, empresaId } satisfies Prisma.DocumentoWhereInput;
}

// Documentos de vehículos no inactivos o de conductores activos. Solo estos reciben avisos.
export const DUENO_ACTIVO = {
  OR: [{ vehiculo: { estado: { not: "inactivo" } } }, { conductor: { activo: true } }],
} satisfies Prisma.DocumentoWhereInput;

export type FiltroDocumentos = {
  estado?: EstadoDocumento;
  tipo?: TipoDocumento;
  incluirInactivos?: boolean;
};

// Filtros del listado de documentos. El estado se filtra por rango de fechas, porque no se guarda.
export function filtroDocumentos(
  empresaId: string,
  hoy: string,
  { estado, tipo, incluirInactivos = false }: FiltroDocumentos = {},
): Prisma.DocumentoWhereInput {
  const { desde, hasta } = estado ? rangoDeEstado(estado, hoy) : {};
  return {
    empresaId,
    tipo,
    fechaVencimiento:
      desde || hasta
        ? {
            gte: desde ? fechaParaBase(desde) : undefined,
            lte: hasta ? fechaParaBase(hasta) : undefined,
          }
        : undefined,
    ...(incluirInactivos ? {} : DUENO_ACTIVO),
  };
}

// Documentos de un vehículo o conductor, para su ficha (incluye los de dueños inactivos).
export function documentosDelDueno(empresaId: string, dueno: Pick<DuenoDocumento, "tipo" | "id">) {
  return (
    dueno.tipo === "vehiculo"
      ? { empresaId, vehiculoId: dueno.id }
      : { empresaId, conductorId: dueno.id }
  ) satisfies Prisma.DocumentoWhereInput;
}

// Del más vencido al que vence más tarde.
export const ORDEN_DOCUMENTOS = [
  { fechaVencimiento: "asc" },
  { tipo: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.DocumentoOrderByWithRelationInput[];
