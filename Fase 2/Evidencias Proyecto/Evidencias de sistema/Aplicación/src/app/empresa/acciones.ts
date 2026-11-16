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

// Guarda los datos de la empresa de la sesión.
export async function guardarEmpresa(formulario: FormData): Promise<ErroresEmpresa> {
  // Revisa que los datos tengan la forma esperada, por si llaman la acción sin el formulario.
  if (!(formulario instanceof FormData)) return { general: "No pudimos guardar los datos." };

  try {
    const actual = await obtenerMiEmpresa();
    if (!actual) return { general: "No encontramos los datos de tu empresa." };

    const resultado = validarEmpresa(Object.fromEntries(formulario), actual.rut);
    if (!resultado.ok) return resultado.errores;

    await actualizarMiEmpresa(resultado.datos);
  } catch (error) {
    // Si no hay sesión, se deja pasar la redirección al login.
    unstable_rethrow(error);
    if (error instanceof RutDeEmpresaDuplicadoError) {
      // No se dice que el RUT es de otra empresa.
      return { rut: "No pudimos registrar ese RUT. Revisa que sea el de tu empresa o escríbenos." };
    }
    if (error instanceof RutYaRegistradoError) {
      return { general: "El RUT de tu empresa ya estaba registrado. Recarga la página." };
    }
    console.error(error);
    return { general: "No pudimos guardar los datos. Intenta nuevamente." };
  }

  // Actualiza el nombre de la empresa en el menú.
  revalidatePath("/", "layout");
  redirect("/empresa?mensaje=guardado");
}
