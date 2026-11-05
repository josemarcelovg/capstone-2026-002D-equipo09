"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { validarEmpresa, type ErroresEmpresa } from "@/lib/empresa";
import {
  actualizarMiEmpresa,
  obtenerMiEmpresa,
  RutDeEmpresaDuplicadoError,
  RutYaRegistradoError,
} from "@/lib/empresa-datos";

/** Guarda los datos de la empresa de la sesión. Si todo sale bien, recarga la página con un mensaje. */
export async function guardarEmpresa(formulario: FormData): Promise<ErroresEmpresa> {
  // Las acciones del servidor se pueden llamar con cualquier dato, no solo desde el formulario.
  if (!(formulario instanceof FormData)) return { general: "No pudimos guardar los datos." };

  try {
    const actual = await obtenerMiEmpresa();
    if (!actual) return { general: "No encontramos los datos de tu empresa." };

    const resultado = validarEmpresa(Object.fromEntries(formulario), actual.rut);
    if (!resultado.ok) return resultado.errores;

    await actualizarMiEmpresa(resultado.datos);
  } catch (error) {
    // Sin sesión, empresaDeLaSesion() redirige al login: esa redirección no es un error.
    unstable_rethrow(error);
    if (error instanceof RutDeEmpresaDuplicadoError) {
      // Sin decir que el RUT pertenece a otra empresa, para no revelarlo.
      return { rut: "No pudimos registrar ese RUT. Revisa que sea el de tu empresa o escríbenos." };
    }
    if (error instanceof RutYaRegistradoError) {
      return { general: "El RUT de tu empresa ya estaba registrado. Recarga la página." };
    }
    console.error(error);
    return { general: "No pudimos guardar los datos. Intenta nuevamente." };
  }

  // El nombre de la empresa aparece en el encabezado de todas las páginas.
  revalidatePath("/", "layout");
  redirect("/empresa?mensaje=guardado");
}
