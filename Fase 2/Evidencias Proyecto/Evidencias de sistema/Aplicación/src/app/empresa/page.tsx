import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerMiEmpresa } from "@/lib/empresa-datos";
import { EmpresaForm } from "./empresa-form";

export const metadata: Metadata = { title: "Mi empresa" };

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

export default async function PaginaEmpresa({ searchParams }: PageProps<"/empresa">) {
  const empresa = await obtenerMiEmpresa();
  if (!empresa) notFound();
  const guardado = primero((await searchParams).mensaje) === "guardado";

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Mi empresa</h1>
      <p className="mt-1 mb-4 text-sm text-stone-600">
        Datos de contacto de tu empresa. El correo de contacto recibe las alertas de vencimiento.
      </p>

      {guardado && (
        <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900">
          Los datos de tu empresa se guardaron.
        </p>
      )}

      <EmpresaForm empresa={empresa} />
    </>
  );
}
