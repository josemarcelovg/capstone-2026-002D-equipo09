import type { Prisma } from "../generated/prisma/client.ts";
import { normalizarNombre } from "./conductores.ts";
import { esRutValido, normalizarRut } from "./rut.ts";

// Filtros de las consultas de conductores. Están aparte de conductores-datos.ts para que
// las pruebas de integración usen exactamente los mismos filtros que la aplicación.
// Toda consulta lleva la empresa de la sesión (JOA-09, sección 4).

/** Un conductor por id, solo si es de la empresa indicada. */
export function conductorDeLaEmpresa(id: string, empresaId: string) {
  return { id, empresaId } satisfies Prisma.ConductorWhereInput;
}

/**
 * Listado de la empresa. Sin `incluirInactivos` no trae los inactivos.
 * `buscar` encuentra parte del nombre (sin importar mayúsculas ni espacios repetidos)
 * o parte del RUT escrito con o sin puntos. Un RUT completo sin guion (`111111111`)
 * también encuentra `11111111-1`.
 */
export function filtroConductores(
  empresaId: string,
  { buscar = "", incluirInactivos = false }: { buscar?: string; incluirInactivos?: boolean } = {},
): Prisma.ConductorWhereInput {
  const texto = normalizarNombre(buscar);
  const rut = texto.toUpperCase().replace(/[\s.]/g, "");
  const rutCompleto = normalizarRut(rut);

  return {
    empresaId,
    activo: incluirInactivos ? undefined : true,
    OR: texto
      ? [
          { nombre: { contains: texto, mode: "insensitive" } },
          { rut: { contains: rut } },
          ...(esRutValido(rutCompleto) ? [{ rut: rutCompleto }] : []),
        ]
      : undefined,
  };
}
