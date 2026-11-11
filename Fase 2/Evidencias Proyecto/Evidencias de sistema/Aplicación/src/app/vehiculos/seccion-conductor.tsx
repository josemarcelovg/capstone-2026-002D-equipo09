import Link from "next/link";
import { formatearTelefono } from "@/lib/conductores";
import { obtenerConductor } from "@/lib/conductores-datos";
import { documentosDe } from "@/lib/documentos-datos";
import { hoyEnChile } from "@/lib/fechas";
import { formatearRut } from "@/lib/rut";
import { ListaDocumentos } from "../documentos/seccion-documentos";

/**
 * El conductor asignado en la ficha del vehículo, con sus documentos y su estado (PB-24,
 * criterio 3). Los documentos del propio vehículo van en su propia sección.
 */
export async function SeccionConductor({ conductorId }: { conductorId: string | null }) {
  // obtenerConductor filtra por la empresa de la sesión, como toda consulta.
  const conductor = conductorId ? await obtenerConductor(conductorId) : null;
  const documentos = conductor ? await documentosDe({ tipo: "conductor", id: conductor.id }) : [];

  return (
    <section
      aria-labelledby="titulo-conductor"
      className="mt-6 rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6"
    >
      <h2 id="titulo-conductor" className="border-l-4 border-orange-600 pl-3 text-lg font-semibold text-stone-900">
        Conductor asignado
      </h2>

      {conductor ? (
        <>
          <p className="mt-2 text-stone-800">
            <Link
              href={`/conductores/${conductor.id}`}
              className="font-medium break-words text-orange-800 hover:underline"
            >
              {conductor.nombre}
            </Link>
          </p>
          <p className="text-sm text-stone-600">
            <span className="font-mono">{formatearRut(conductor.rut)}</span> ·{" "}
            {formatearTelefono(conductor.telefono)}
          </p>

          <h3 className="mt-4 text-sm font-semibold text-stone-800">Sus documentos</h3>
          {documentos.length === 0 ? (
            <p className="mt-2 text-sm text-stone-700">
              Aún no tiene documentos registrados. Se agregan desde su ficha.
            </p>
          ) : (
            <ListaDocumentos documentos={documentos} hoy={hoyEnChile()} />
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-stone-700">
          Este vehículo no tiene conductor asignado. Puedes elegirlo arriba, en «Conductor asignado».
        </p>
      )}
    </section>
  );
}
