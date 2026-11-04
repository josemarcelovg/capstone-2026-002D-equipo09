import type { Prisma } from "../generated/prisma/client.ts";
import {
  rangoDeEstado,
  type DuenoDocumento,
  type EstadoDocumento,
  type TipoDocumento,
} from "./documentos.ts";
import { fechaParaBase } from "./fechas.ts";

// Filtros de las consultas de documentos. Están aparte de documentos-datos.ts para que las
// pruebas de integración y el proceso de avisos usen exactamente los mismos filtros que la
// aplicación (JOA-10, sección 3.4). Toda consulta lleva la empresa de la sesión.
// Importa con rutas relativas para que las pruebas lo carguen sin Next.js.

/** Un documento por id, solo si es de la empresa indicada. */
export function documentoDeLaEmpresa(id: string, empresaId: string) {
  return { id, empresaId } satisfies Prisma.DocumentoWhereInput;
}

/**
 * Documentos cuyo dueño está activo: un vehículo que no está inactivo (en mantención sí cuenta)
 * o un conductor activo. Los demás no aparecen por defecto ni generan avisos (JOA-10, sección 2).
 */
export const DUENO_ACTIVO = {
  OR: [{ vehiculo: { estado: { not: "inactivo" } } }, { conductor: { activo: true } }],
} satisfies Prisma.DocumentoWhereInput;

export type FiltroDocumentos = {
  estado?: EstadoDocumento;
  tipo?: TipoDocumento;
  incluirInactivos?: boolean;
};

/**
 * Listado general de la empresa (JOA-10, sección 4). `hoy` es `hoyEnChile()`: el estado no se
 * guarda, así que se filtra por el rango de fechas que le corresponde.
 */
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

/** Los documentos de un vehículo o de un conductor, para su ficha. Incluye los de dueños inactivos. */
export function documentosDelDueno(empresaId: string, dueno: Pick<DuenoDocumento, "tipo" | "id">) {
  return (
    dueno.tipo === "vehiculo"
      ? { empresaId, vehiculoId: dueno.id }
      : { empresaId, conductorId: dueno.id }
  ) satisfies Prisma.DocumentoWhereInput;
}

/** Del más vencido al más lejano; a igual fecha, en el orden de los tipos. */
export const ORDEN_DOCUMENTOS = [
  { fechaVencimiento: "asc" },
  { tipo: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.DocumentoOrderByWithRelationInput[];
