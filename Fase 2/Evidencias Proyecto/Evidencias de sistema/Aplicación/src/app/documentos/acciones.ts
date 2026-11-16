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

export type ErroresGuardado = ErroresDocumento & { repetidoId?: string };

// Registra un documento nuevo o guarda los cambios, y vuelve al listado o a la ficha.
export async function guardarDocumento(
  id: string | null,
  origen: Origen,
  formulario: FormData,
): Promise<ErroresGuardado> {
  // Revisa que los datos tengan la forma esperada, por si llaman la acción sin el formulario.
  if (!(formulario instanceof FormData) || (id !== null && typeof id !== "string")) {
    return { general: NO_ENCONTRADO };
  }
  // La empresa se toma de la sesión, nunca del formulario.
  const resultado = validarDocumento(Object.fromEntries(formulario), hoyEnChile());
  if (!resultado.ok) return resultado.errores;
  const { datos } = resultado;

  let dueno: DuenoDocumento | null;
  try {
    dueno = id !== null ? await actualizarDocumento(id, datos) : await crearDocumento(datos);
  } catch (error) {
    // Si no hay sesión, se deja pasar la redirección al login.
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
