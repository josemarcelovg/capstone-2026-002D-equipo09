"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { validarConductor, type ErroresConductor } from "@/lib/conductores";
import {
  actualizarConductor,
  crearConductor,
  RutDuplicadoError,
} from "@/lib/conductores-datos";
import { formatearRut } from "@/lib/rut";

const NO_ENCONTRADO = "No encontramos el conductor. Vuelve al listado.";

/**
 * Registra un conductor (`id` nulo) o guarda los cambios de uno existente.
 * Si todo sale bien vuelve al listado; si no, devuelve un error por campo.
 * El estado (activo o inactivo) solo cambia con `cambiarActivacion`.
 */
export async function guardarConductor(
  id: string | null,
  formulario: FormData,
): Promise<ErroresConductor> {
  // Las acciones del servidor se pueden llamar con cualquier dato, no solo desde el formulario.
  if (!(formulario instanceof FormData) || (id !== null && typeof id !== "string")) {
    return { general: NO_ENCONTRADO };
  }
  const resultado = validarConductor(Object.fromEntries(formulario));
  if (!resultado.ok) return resultado.errores;
  const { datos } = resultado;

  try {
    if (id !== null) {
      if (!(await actualizarConductor(id, datos))) return { general: NO_ENCONTRADO };
    } else {
      await crearConductor(datos);
    }
  } catch (error) {
    // Sin sesión, empresaDeLaSesion() redirige al login (SIM-02): esa redirección no es un error.
    unstable_rethrow(error);
    if (error instanceof RutDuplicadoError) {
      const rut = formatearRut(datos.rut);
      return {
        rut: error.inactivo
          ? `Ya tienes un conductor inactivo con el RUT ${rut}. Búscalo con «Incluir inactivos» y reactívalo.`
          : `Ya tienes un conductor registrado con el RUT ${rut}.`,
      };
    }
    console.error(error);
    return { general: "No pudimos guardar el conductor. Intenta nuevamente." };
  }

  revalidatePath("/conductores");
  redirect(`/conductores?mensaje=${id !== null ? "actualizado" : "creado"}`);
}

/**
 * Desactiva (`activar` falso) o reactiva un conductor. Nunca se elimina.
 * Si algo falla devuelve el mensaje para mostrar.
 */
export async function cambiarActivacion(id: string, activar: boolean) {
  // Las acciones del servidor se pueden llamar con cualquier dato: solo `true` reactiva.
  if (typeof id !== "string") redirect("/conductores");
  const reactivar = activar === true;
  let conductor;
  try {
    conductor = await actualizarConductor(id, { activo: reactivar });
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return "No pudimos cambiar el estado del conductor. Intenta nuevamente.";
  }
  revalidatePath("/conductores");
  if (!conductor) redirect("/conductores");
  redirect(`/conductores?mensaje=${reactivar ? "reactivado" : "desactivado"}`);
}
