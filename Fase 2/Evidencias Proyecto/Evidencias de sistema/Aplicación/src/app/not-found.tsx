import type { Metadata } from "next";
import Link from "next/link";

// Título de la pestaña en todas las páginas 404, también cuando la ficha de un vehículo
// llama a notFound() (observación 1 de SIM-03).
export const metadata: Metadata = { title: "No encontrado" };

export default function NoEncontrado() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">No encontrado</h1>
      <p className="mt-2 text-zinc-700">No encontramos lo que buscas.</p>
      <Link
        href="/vehiculos"
        className="mt-4 inline-block font-medium text-blue-800 hover:underline"
      >
        Volver al listado de vehículos
      </Link>
    </div>
  );
}
