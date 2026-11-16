import type { Metadata } from "next";
import { EnlaceVolver } from "./enlace-volver";
import { IconoBuscar } from "./iconos";

// Título de la pestaña en las páginas que no existen.
export const metadata: Metadata = { title: "No encontrado" };

export default function NoEncontrado() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm px-4 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
        <IconoBuscar className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">No encontrado</h1>
      <p className="mt-2 text-stone-700">No encontramos lo que buscas.</p>
      <EnlaceVolver className="mt-4 inline-block font-medium text-orange-800 hover:underline" />
    </div>
  );
}
