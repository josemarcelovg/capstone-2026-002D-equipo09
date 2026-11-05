"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  fichaDelDueno,
  mensajeDuenoInactivo,
  mensajeRepetido,
  validarDocumento,
  type DuenoDocumento,
  type ErroresDocumento,
  type Origen,
} from "@/lib/documentos";
import {
  actualizarDocumento,
  CambioDeDuenoError,
  crearDocumento,
  DocumentoRepetidoError,
  DuenoInactivoError,
  DuenoNoEncontradoError,
} from "@/lib/documentos-datos";
import { hoyEnChile } from "@/lib/fechas";

const NO_ENCONTRADO = "No encontramos el documento. Vuelve al listado.";

/** Los errores por campo y, si el documento ya existe, su id para ir a editarlo. */
export type ErroresGuardado = ErroresDocumento & { repetidoId?: string };

/**
 * Registra un documento (`id` nulo) o guarda los cambios de uno existente. Si todo sale bien
 * vuelve a donde se abrió el formulario (el listado o la ficha del dueño) con un mensaje; si no,
 * devuelve un error por campo.
 */
export async function guardarDocumento(
  id: string | null,
  origen: Origen,
  formulario: FormData,
): Promise<ErroresGuardado> {
  // Las acciones del servidor se pueden llamar con cualquier dato, no solo desde el formulario.
  if (!(formulario instanceof FormData) || (id !== null && typeof id !== "string")) {
    return { general: NO_ENCONTRADO };
  }
  // El empresa_id que venga en el formulario se ignora: el esquema no lo lee y el acceso a
  // datos usa el de la sesión (JOA-10, sección 5.2).
  const resultado = validarDocumento(Object.fromEntries(formulario), hoyEnChile());
  if (!resultado.ok) return resultado.errores;
  const { datos } = resultado;

  let dueno: DuenoDocumento | null;
  try {
    dueno = id !== null ? await actualizarDocumento(id, datos) : await crearDocumento(datos);
  } catch (error) {
    // Sin sesión, empresaDeLaSesion() redirige al login (SIM-02): esa redirección no es un error.
    unstable_rethrow(error);
    if (error instanceof DuenoNoEncontradoError) {
      return { general: "No encontramos el vehículo o conductor elegido. Recarga la página e intenta nuevamente." };
    }
    if (error instanceof DuenoInactivoError) return { dueno: mensajeDuenoInactivo(error.dueno) };
    if (error instanceof DocumentoRepetidoError) {
      return {
        tipo: mensajeRepetido(error.tipo, error.dueno.tipo, error.dueno.nombre),
        repetidoId: error.existenteId,
      };
    }
    if (error instanceof CambioDeDuenoError) {
      return {
        dueno:
          error.actual === "vehiculo"
            ? "Este documento es de un vehículo: solo puedes pasarlo a otro vehículo."
            : "Este documento es de un conductor: solo puedes pasarlo a otro conductor.",
      };
    }
    console.error(error);
    return { general: "No pudimos guardar el documento. Intenta nuevamente." };
  }
  if (!dueno) return { general: NO_ENCONTRADO };

  const ficha = fichaDelDueno(dueno);
  revalidatePath("/documentos");
  revalidatePath(ficha);
  const accion = id !== null ? "actualizado" : "creado";
  redirect(origen === "ficha" ? `${ficha}?mensaje=documento-${accion}` : `/documentos?mensaje=${accion}`);
}
