import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerConductor } from "@/lib/conductores-datos";
import { fichaDelDueno, mensajeDuenoInactivo, type DuenoDocumento } from "@/lib/documentos";
import { formatearPatente } from "@/lib/vehiculos";
import { obtenerVehiculo } from "@/lib/vehiculos-datos";
import { DocumentoForm } from "../documento-form";
import { opcionesDeDueno } from "../opciones";

export const metadata: Metadata = { title: "Registrar documento" };

type Parametros = Awaited<PageProps<"/documentos/nuevo">["searchParams"]>;

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

/**
 * El dueño elegido al llegar desde una ficha (`?vehiculo=<id>` o `?conductor=<id>`).
 * `undefined` si no viene ninguno y `null` si no existe en la empresa de la sesión.
 */
async function duenoDeLaFicha(parametros: Parametros): Promise<DuenoDocumento | null | undefined> {
  const idVehiculo = primero(parametros.vehiculo);
  const idConductor = primero(parametros.conductor);
  if (idVehiculo) {
    const vehiculo = await obtenerVehiculo(idVehiculo);
    return (
      vehiculo && {
        tipo: "vehiculo",
        id: vehiculo.id,
        nombre: formatearPatente(vehiculo.patente),
        activo: vehiculo.estado !== "inactivo",
      }
    );
  }
  if (idConductor) {
    const conductor = await obtenerConductor(idConductor);
    return (
      conductor && { tipo: "conductor", id: conductor.id, nombre: conductor.nombre, activo: conductor.activo }
    );
  }
  return undefined;
}

export default async function PaginaNuevoDocumento({ searchParams }: PageProps<"/documentos/nuevo">) {
  const dueno = await duenoDeLaFicha(await searchParams);
  // Un vehículo o conductor de otra empresa responde "no encontrado" (JOA-10, criterio 14).
  if (dueno === null) notFound();

  const volver = dueno
    ? {
        href: fichaDelDueno(dueno),
        texto: dueno.tipo === "vehiculo" ? `← Volver al vehículo ${dueno.nombre}` : `← Volver a ${dueno.nombre}`,
      }
    : { href: "/documentos", texto: "← Volver al listado" };

  return (
    <>
      <Link href={volver.href} className="text-sm font-medium text-blue-800 hover:underline">
        {volver.texto}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Registrar documento</h1>
      {dueno && (
        <p className="mt-1 text-zinc-700">
          {dueno.tipo === "vehiculo" ? `Del vehículo ${dueno.nombre}` : `De ${dueno.nombre}`}
        </p>
      )}

      <div className="mt-4">
        {dueno && !dueno.activo ? (
          <p role="alert" className="rounded-lg border border-zinc-200 bg-white px-4 py-6 text-zinc-700">
            {mensajeDuenoInactivo(dueno.tipo)}
          </p>
        ) : (
          <DocumentoForm
            duenoFijo={dueno}
            origen={dueno ? "ficha" : "listado"}
            {...await opcionesDeDueno(dueno?.tipo)}
          />
        )}
      </div>
    </>
  );
}
