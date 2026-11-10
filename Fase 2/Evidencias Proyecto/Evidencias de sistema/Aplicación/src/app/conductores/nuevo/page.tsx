import type { Metadata } from "next";
import Link from "next/link";
import { ConductorForm } from "../conductor-form";

export const metadata: Metadata = { title: "Registrar conductor" };

export default function PaginaNuevoConductor() {
  return (
    <>
      <Link href="/conductores" className="text-sm font-medium text-orange-800 hover:underline">
        ← Volver al listado
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Registrar conductor</h1>
      <ConductorForm />
    </>
  );
}
