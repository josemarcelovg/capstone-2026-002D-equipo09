import Link from "next/link";
import { mensajeDuenoInactivo, nombreDelDocumento, type DuenoDocumento } from "@/lib/documentos";
import { documentosDe } from "@/lib/documentos-datos";
import { formatearFecha, hoyEnChile } from "@/lib/fechas";
import { InsigniaVencimiento } from "./insignia-estado";

const MENSAJES = new Map([
  ["documento-creado", "Documento registrado correctamente."],
  ["documento-actualizado", "Los cambios del documento se guardaron."],
]);

/** El mensaje de confirmación al volver a la ficha después de guardar un documento. */
export function mensajeDeDocumento(valor: string | string[] | undefined) {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto ? MENSAJES.get(texto) : undefined;
}

/**
 * La sección "Documentos" de la ficha de un vehículo o conductor (JOA-10, sección 4). "Agregar
 * documento" abre el formulario con este dueño elegido y no aparece si el dueño está inactivo.
 */
export async function SeccionDocumentos({ dueno }: { dueno: DuenoDocumento }) {
  const documentos = await documentosDe(dueno);
  const hoy = hoyEnChile();

  return (
    <section
      aria-labelledby="titulo-documentos"
      className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="titulo-documentos" className="text-lg font-semibold text-zinc-900">
          Documentos
        </h2>
        {dueno.activo && (
          <Link
            href={`/documentos/nuevo?${dueno.tipo}=${dueno.id}`}
            className="rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800"
          >
            Agregar documento
          </Link>
        )}
      </div>

      {documentos.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-700">
          {dueno.tipo === "vehiculo" ? "Este vehículo" : "Este conductor"} aún no tiene documentos
          registrados.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100">
          {documentos.map((documento) => (
            <li
              key={documento.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium break-words text-zinc-900">{nombreDelDocumento(documento)}</p>
                <p className="text-sm text-zinc-600">Vence el {formatearFecha(documento.fechaVencimiento)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                <Link
                  href={`/documentos/${documento.id}?volver=ficha`}
                  className="text-sm font-medium text-blue-800 hover:underline"
                  aria-label={`Editar ${nombreDelDocumento(documento)}`}
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!dueno.activo && <p className="mt-3 text-sm text-zinc-600">{mensajeDuenoInactivo(dueno.tipo)}</p>}
    </section>
  );
}
