import type { Metadata } from "next";
import Link from "next/link";
import { IconoBuscar } from "./iconos";

// Título de la pestaña en todas las páginas 404, también cuando la ficha de un vehículo
// llama a notFound() (observación 1 de SIM-03).
export const metadata: Metadata = { title: "No encontrado" };

export default function NoEncontrado() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm px-4 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
        <IconoBuscar className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">No encontrado</h1>
      <p className="mt-2 text-stone-700">No encontramos lo que buscas.</p>
      <Link
        href="/vehiculos"
        className="mt-4 inline-block font-medium text-orange-800 hover:underline"
      >
        Volver al listado de vehículos
      </Link>
    </div>
  );
}
