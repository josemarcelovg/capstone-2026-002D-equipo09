import type { Prisma } from "../generated/prisma/client.ts";
import { normalizarNombre } from "./conductores.ts";
import { esRutValido, normalizarRut } from "./rut.ts";

// Filtros de las consultas de conductores. Están aparte para que la app y las pruebas usen los mismos.

export function conductorDeLaEmpresa(id: string, empresaId: string) {
  return { id, empresaId } satisfies Prisma.ConductorWhereInput;
}

// Listado de la empresa. La búsqueda encuentra parte del nombre o del RUT, con o sin puntos.
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
