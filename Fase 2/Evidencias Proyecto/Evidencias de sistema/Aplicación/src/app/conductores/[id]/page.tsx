import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { obtenerConductor } from "@/lib/conductores-datos";
import { vehiculosDelConductor } from "@/lib/vehiculos-datos";
import { mensajeDeDocumento, SeccionDocumentos } from "../../documentos/seccion-documentos";
import { BotonActivacion } from "../boton-activacion";
import { ConductorForm } from "../conductor-form";
import { InsigniaEstado } from "../insignia-estado";
import { VehiculosAsignados } from "../vehiculos-asignados";

// El título y la página buscan el mismo conductor con una sola consulta por solicitud.
const buscarConductor = cache(obtenerConductor);

// Título calculado para que un conductor inexistente o de otra empresa diga "No encontrado"
// también en la pestaña (igual que vehículos, observación 1 de SIM-03).
export async function generateMetadata({ params }: PageProps<"/conductores/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscarConductor(id)) ? "Detalle del conductor" : "No encontrado" };
}

export default async function PaginaConductor({ params, searchParams }: PageProps<"/conductores/[id]">) {
  const { id } = await params;
  const conductor = await buscarConductor(id);
  if (!conductor) notFound();
  const mensaje = mensajeDeDocumento((await searchParams).mensaje);
  const vehiculos = await vehiculosDelConductor(conductor.id);

  return (
    <>
      <Link href="/conductores" className="text-sm font-medium text-orange-800 hover:underline">
        ← Volver al listado
      </Link>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold break-words text-stone-900">{conductor.nombre}</h1>
        <InsigniaEstado activo={conductor.activo} />
      </div>

      {mensaje && (
        <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900">
          {mensaje}
        </p>
      )}

      <ConductorForm conductor={conductor} />

      <VehiculosAsignados vehiculos={vehiculos} />

      <SeccionDocumentos
        dueno={{ tipo: "conductor", id: conductor.id, nombre: conductor.nombre, activo: conductor.activo }}
      />

      <section className="mt-6 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-stone-700">
          {conductor.activo
            ? "Si el conductor ya no trabaja en la empresa, desactívalo. No se elimina y se puede reactivar."
            : "Este conductor está inactivo y no aparece en el listado. Puedes reactivarlo cuando quieras."}
        </p>
        <BotonActivacion
          id={conductor.id}
          nombre={conductor.nombre}
          inactivo={!conductor.activo}
          vehiculosAsignados={vehiculos.length}
        />
      </section>
    </>
  );
}
