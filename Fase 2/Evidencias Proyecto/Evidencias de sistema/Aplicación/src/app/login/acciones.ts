"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  accesoDelEntorno,
  mensajeDeErrorDeAcceso,
  RUTA_LOGIN,
  validarCredenciales,
  type ErroresAcceso,
} from "@/lib/acceso";
import { prisma } from "@/lib/prisma";
import { crearClienteSupabase } from "@/lib/supabase";

export type EstadoLogin = { errores: ErroresAcceso; correo: string };

const ERROR_GENERAL = "No pudimos iniciar sesión. Intenta nuevamente.";

/** Inicia sesión con Supabase Auth. Si todo sale bien va al listado de vehículos (JOA-01, 7.1). */
export async function iniciarSesion(
  _anterior: EstadoLogin,
  formulario: FormData,
): Promise<EstadoLogin> {
  const correo = String(formulario.get("correo") ?? "");
  const resultado = validarCredenciales({ correo, contrasena: formulario.get("contrasena") });
  if (!resultado.ok) return { errores: resultado.errores, correo };

  const acceso = accesoDelEntorno();
  if (acceso.modo !== "supabase") return { errores: { general: ERROR_GENERAL }, correo };

  try {
    const supabase = await crearClienteSupabase(acceso.url, acceso.clave);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: resultado.datos.correo,
      password: resultado.datos.contrasena,
    });
    if (error) {
      if (error.status !== 400) console.error(error);
      return { errores: { general: mensajeDeErrorDeAcceso(error) }, correo };
    }

    // La cuenta existe en Supabase Auth, pero sin perfil no sabemos su empresa (JOS-02, 7).
    const perfil = await prisma.usuario.findUnique({
      where: { id: data.user.id },
      select: { id: true },
    });
    if (!perfil) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        errores: { general: "Tu cuenta no tiene una empresa asignada. Contacta al equipo de MicroLogist." },
        correo,
      };
    }
  } catch (error) {
    console.error(error);
    return { errores: { general: ERROR_GENERAL }, correo };
  }

  revalidatePath("/", "layout");
  redirect("/vehiculos");
}

/** Cierra la sesión en este navegador y vuelve al inicio de sesión. */
export async function cerrarSesion() {
  const acceso = accesoDelEntorno();
  if (acceso.modo === "supabase") {
    const supabase = await crearClienteSupabase(acceso.url, acceso.clave);
    await supabase.auth.signOut({ scope: "local" });
  }
  // Descarta las páginas privadas que el navegador tenía guardadas (JOA-01, criterio 7.4).
  revalidatePath("/", "layout");
  redirect(RUTA_LOGIN);
}
