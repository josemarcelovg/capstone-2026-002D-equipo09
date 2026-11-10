import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fichaDelDueno, nombreDelDocumento, type Origen } from "@/lib/documentos";
import { obtenerDocumento } from "@/lib/documentos-datos";
import { hoyEnChile } from "@/lib/fechas";
import { DocumentoForm } from "../documento-form";
import { InsigniaVencimiento } from "../insignia-estado";
import { opcionesDeDueno } from "../opciones";

// El título y la página buscan el mismo documento con una sola consulta por solicitud.
const buscarDocumento = cache(obtenerDocumento);

// Título calculado para que un documento inexistente o de otra empresa diga "No encontrado"
// también en la pestaña (igual que vehículos, observación 1 de SIM-03).
export async function generateMetadata({ params }: PageProps<"/documentos/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscarDocumento(id)) ? "Editar documento" : "No encontrado" };
}

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

/** Renovar (nueva fecha) o corregir un documento (PB-13). */
export default async function PaginaDocumento({ params, searchParams }: PageProps<"/documentos/[id]">) {
  const { id } = await params;
  const documento = await buscarDocumento(id);
  if (!documento) notFound();

  const origen: Origen = primero((await searchParams).volver) === "ficha" ? "ficha" : "listado";
  const { dueno } = documento;
  const ficha = fichaDelDueno(dueno);
  const volver =
    origen === "ficha"
      ? {
          href: ficha,
          texto: dueno.tipo === "vehiculo" ? `← Volver al vehículo ${dueno.nombre}` : `← Volver a ${dueno.nombre}`,
        }
      : { href: "/documentos", texto: "← Volver al listado" };

  return (
    <>
      <Link href={volver.href} className="text-sm font-medium text-orange-800 hover:underline">
        {volver.texto}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold break-words text-stone-900">{nombreDelDocumento(documento)}</h1>
        <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoyEnChile()} />
      </div>
      <p className="mt-1 mb-4 text-sm text-stone-700">
        {dueno.tipo === "vehiculo" ? "Del vehículo " : "De "}
        <Link href={ficha} className="font-medium text-orange-800 hover:underline">
          {dueno.nombre}
        </Link>
        {!dueno.activo && " (inactivo)"}. Para renovarlo, cambia la fecha de vencimiento por la del
        documento nuevo.
      </p>

      <DocumentoForm documento={documento} origen={origen} {...await opcionesDeDueno(dueno.tipo, dueno)} />
    </>
  );
}
