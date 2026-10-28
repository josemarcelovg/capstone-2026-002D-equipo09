import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { obtenerConductor } from "@/lib/conductores-datos";
import { BotonActivacion } from "../boton-activacion";
import { ConductorForm } from "../conductor-form";
import { InsigniaEstado } from "../insignia-estado";

// El título y la página buscan el mismo conductor con una sola consulta por solicitud.
const buscarConductor = cache(obtenerConductor);

// Título calculado para que un conductor inexistente o de otra empresa diga "No encontrado"
// también en la pestaña (igual que vehículos, observación 1 de SIM-03).
export async function generateMetadata({ params }: PageProps<"/conductores/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscarConductor(id)) ? "Detalle del conductor" : "No encontrado" };
}

export default async function PaginaConductor({ params }: PageProps<"/conductores/[id]">) {
  const { id } = await params;
  const conductor = await buscarConductor(id);
  if (!conductor) notFound();

  return (
    <>
      <Link href="/conductores" className="text-sm font-medium text-blue-800 hover:underline">
        ← Volver al listado
      </Link>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold break-words text-zinc-900">{conductor.nombre}</h1>
        <InsigniaEstado activo={conductor.activo} />
      </div>

      <ConductorForm conductor={conductor} />

      <section className="mt-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-zinc-700">
          {conductor.activo
            ? "Si el conductor ya no trabaja en la empresa, desactívalo. No se elimina y se puede reactivar."
            : "Este conductor está inactivo y no aparece en el listado. Puedes reactivarlo cuando quieras."}
        </p>
        <BotonActivacion id={conductor.id} nombre={conductor.nombre} inactivo={!conductor.activo} />
      </section>
    </>
  );
}
