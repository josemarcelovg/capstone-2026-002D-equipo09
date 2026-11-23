"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { MENSAJES_TURNO, validarAnulacion, validarTurno, type ErroresTurno } from "@/lib/turnos";
import {
  actualizarTurno,
  anularTurno,
  crearTurno,
  NoEncontradoError,
  TurnoNoModificableError,
  TurnoNoValidoError,
} from "@/lib/turnos-datos";
import { contextoDeTurnos } from "@/lib/turnos-sesion";

const NO_ENCONTRADO = "No encontramos el turno, el vehículo o el conductor. Vuelve a los turnos.";

// Asigna un turno nuevo o guarda los cambios de uno existente. Vuelve a la vista de ese día.
export async function guardarTurno(id: string | null, formulario: FormData): Promise<ErroresTurno> {
  // Revisa que los datos tengan la forma esperada, por si llaman la acción sin el formulario.
  if (!(formulario instanceof FormData) || (id !== null && typeof id !== "string")) {
    return { general: NO_ENCONTRADO };
  }

  let fecha: string;
  try {
    const contexto = await contextoDeTurnos();
    const resultado = validarTurno(Object.fromEntries(formulario), contexto.hoy);
    if (!resultado.ok) return resultado.errores;
    fecha = resultado.datos.fecha;

    if (id !== null) {
      if (!(await actualizarTurno(contexto, id, resultado.datos))) return { general: NO_ENCONTRADO };
    } else {
      await crearTurno(contexto, resultado.datos);
    }
  } catch (error) {
    // Si no hay sesión, se deja pasar la redirección al login.
    unstable_rethrow(error);
    if (error instanceof TurnoNoValidoError) return error.errores;
    if (error instanceof NoEncontradoError) return { general: NO_ENCONTRADO };
    if (error instanceof TurnoNoModificableError) return { general: MENSAJES_TURNO.noModificable };
    console.error(error);
    return { general: MENSAJES_TURNO.errorServidor };
  }

  revalidatePath("/turnos");
  redirect(`/turnos?fecha=${fecha}&mensaje=${id !== null ? "editado" : "asignado"}`);
}

// Marca el turno como anulado, con el motivo si se escribió. Nunca se borra.
export async function anularDesdePantalla(id: string, motivo: string): Promise<string> {
  if (typeof id !== "string") return NO_ENCONTRADO;
  const resultado = validarAnulacion({ motivo });
  if (!resultado.ok) return resultado.error;

  let fecha: string | undefined;
  try {
    fecha = (await anularTurno(await contextoDeTurnos(), id, resultado.motivo))?.fecha;
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof TurnoNoModificableError) return MENSAJES_TURNO.noModificable;
    console.error(error);
    return MENSAJES_TURNO.errorServidor;
  }
  if (!fecha) return NO_ENCONTRADO;

  revalidatePath("/turnos");
  redirect(`/turnos?fecha=${fecha}&mensaje=anulado`);
}
