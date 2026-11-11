import Link from "next/link";
import {
  mensajeDuenoInactivo,
  nombreDelDocumento,
  type Documento,
  type DuenoDocumento,
} from "@/lib/documentos";
import { documentosDe } from "@/lib/documentos-datos";
import { formatearFecha, hoyEnChile } from "@/lib/fechas";
import { BOTON_PRINCIPAL, TARJETA } from "../estilos";
import { IconoMas } from "../iconos";
import { BARRA_ESTADO } from "../insignia";
import { IconoEstadoDocumento, InsigniaVencimiento, tonoDocumento } from "./insignia-estado";

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
      className={`${TARJETA} mt-6 p-4 sm:p-6`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="titulo-documentos" className="border-l-4 border-orange-600 pl-3 text-lg font-semibold text-stone-900">
          Documentos
        </h2>
        {dueno.activo && (
          <Link
            href={`/documentos/nuevo?${dueno.tipo}=${dueno.id}`}
            className={BOTON_PRINCIPAL}
          >
            <IconoMas className="size-4" />
            Agregar documento
          </Link>
        )}
      </div>

      {documentos.length === 0 ? (
        <p className="mt-3 text-sm text-stone-700">
          {dueno.tipo === "vehiculo" ? "Este vehículo" : "Este conductor"} aún no tiene documentos
          registrados.
        </p>
      ) : (
        <ListaDocumentos documentos={documentos} hoy={hoy} />
      )}

      {!dueno.activo && <p className="mt-3 text-sm text-stone-600">{mensajeDuenoInactivo(dueno.tipo)}</p>}
    </section>
  );
}

/**
 * Los documentos de un dueño con su estado y "Editar", que vuelve a la ficha de ese dueño.
 * La usan esta sección y la del conductor asignado en la ficha del vehículo (PB-24).
 */
export function ListaDocumentos({ documentos, hoy }: { documentos: Documento[]; hoy: string }) {
  return (
    <ul className="mt-3 divide-y divide-stone-100">
      {documentos.map((documento) => (
        <li
          key={documento.id}
          className={`flex flex-col gap-2 py-3 pl-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${BARRA_ESTADO[tonoDocumento(documento.fechaVencimiento, hoy)]}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <IconoEstadoDocumento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
            <div className="min-w-0">
              <p className="font-medium break-words text-stone-900">{nombreDelDocumento(documento)}</p>
              <p className="text-sm text-stone-600">Vence el {formatearFecha(documento.fechaVencimiento)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
            <Link
              href={`/documentos/${documento.id}?volver=ficha`}
              className="text-sm font-medium text-orange-800 hover:underline"
              aria-label={`Editar ${nombreDelDocumento(documento)}`}
            >
              Editar
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
