import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatearPatente } from "@/lib/vehiculos";
import { obtenerVehiculo } from "@/lib/vehiculos-datos";
import { BotonActivacion } from "../boton-activacion";
import { InsigniaEstado } from "../insignia-estado";
import { VehiculoForm } from "../vehiculo-form";

// El título y la página buscan el mismo vehículo con una sola consulta por solicitud.
const buscarVehiculo = cache(obtenerVehiculo);

// Con un título fijo, el navegador volvía a "Detalle del vehículo" al terminar de cargar la
// página "No encontrado" (observación 1 de SIM-03).
export async function generateMetadata({ params }: PageProps<"/vehiculos/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscarVehiculo(id)) ? "Detalle del vehículo" : "No encontrado" };
}

export default async function PaginaVehiculo({ params }: PageProps<"/vehiculos/[id]">) {
  const { id } = await params;
  const vehiculo = await buscarVehiculo(id);
  if (!vehiculo) notFound();

  const patente = formatearPatente(vehiculo.patente);
  const inactivo = vehiculo.estado === "inactivo";

  return (
    <>
      <Link href="/vehiculos" className="text-sm font-medium text-blue-800 hover:underline">
        ← Volver al listado
      </Link>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Vehículo {patente}</h1>
        <InsigniaEstado estado={vehiculo.estado} />
      </div>

      <VehiculoForm vehiculo={vehiculo} />

      <section className="mt-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-zinc-700">
          {inactivo
            ? "Este vehículo está inactivo y no aparece en el listado. Puedes reactivarlo cuando quieras."
            : "Si el vehículo se vendió o dejó de usarse, desactívalo. No se elimina y se puede reactivar."}
        </p>
        <BotonActivacion id={vehiculo.id} patente={patente} inactivo={inactivo} />
      </section>
    </>
  );
}
