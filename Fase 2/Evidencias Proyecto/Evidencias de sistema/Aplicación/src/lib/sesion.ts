import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { accesoDelEntorno, RUTA_LOGIN } from "@/lib/acceso";
import { prisma } from "@/lib/prisma";
import { crearClienteSupabase } from "@/lib/supabase";

// Usuario y empresa de la sesión (SIM-02). El empresa_id nunca viene del formulario:
// el servidor lo toma de aquí (JOA-01, sección 2.4).
//
// Con Supabase Auth configurado, la sesión se valida contra Supabase en cada solicitud
// (getUser) y la empresa sale del perfil en la tabla `usuario`, que tiene el mismo id
// que el usuario de Supabase Auth (JOS-02, sección 7).
//
// Sin Supabase y solo en desarrollo (por ejemplo, en Docker), se usa la empresa de
// EMPRESA_DESARROLLO_ID. En producción sin Supabase no se muestran datos.

export type UsuarioDeLaSesion = {
  nombre: string;
  empresaId: string;
  empresaNombre: string;
  modo: "supabase" | "desarrollo";
};

/**
 * `null` si no hay sesión o si la cuenta no tiene perfil en `usuario`.
 * Se consulta una sola vez por solicitud aunque la llamen el encabezado y la página.
 */
export const usuarioDeLaSesion = cache(async (): Promise<UsuarioDeLaSesion | null> => {
  // La sesión es de cada solicitud: nada de esto se puede generar durante el build.
  await connection();
  const acceso = accesoDelEntorno();
  if (acceso.modo === "sin-configurar") {
    throw new Error(`El inicio de sesión no está configurado. ${acceso.motivo}`);
  }

  if (acceso.modo === "desarrollo") {
    const empresa = await prisma.empresa.findUnique({
      where: { id: acceso.empresaId },
      select: { nombre: true },
    });
    return {
      nombre: "Modo desarrollo",
      empresaId: acceso.empresaId,
      empresaNombre: empresa?.nombre ?? "Empresa de desarrollo",
      modo: "desarrollo",
    };
  }

  const supabase = await crearClienteSupabase(acceso.url, acceso.clave);
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const perfil = await prisma.usuario.findUnique({
    where: { id: data.user.id },
    select: { nombre: true, empresaId: true, empresa: { select: { nombre: true } } },
  });
  if (!perfil) return null;

  return {
    nombre: perfil.nombre,
    empresaId: perfil.empresaId,
    empresaNombre: perfil.empresa.nombre,
    modo: "supabase",
  };
});

/** Empresa del usuario que inició sesión. Sin sesión, redirige al inicio de sesión. */
export async function empresaDeLaSesion(): Promise<string> {
  const usuario = await usuarioDeLaSesion();
  if (!usuario) redirect(RUTA_LOGIN);
  return usuario.empresaId;
}
