import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { accesoDelEntorno, RUTA_LOGIN } from "@/lib/acceso";
import { prisma } from "@/lib/prisma";
import { crearClienteSupabase } from "@/lib/supabase";

// Usuario y empresa de quien inició sesión. La empresa siempre sale de aquí y nunca del
// formulario, para que nadie pueda ver ni guardar datos de otra empresa.

export type UsuarioDeLaSesion = {
  nombre: string;
  empresaId: string;
  empresaNombre: string;
  modo: "supabase" | "desarrollo";
};

// Devuelve null si no hay sesión o si la cuenta no tiene perfil. Se consulta una vez por solicitud.
export const usuarioDeLaSesion = cache(async (): Promise<UsuarioDeLaSesion | null> => {
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

// La empresa del usuario. Si no hay sesión, lo manda al login.
export async function empresaDeLaSesion(): Promise<string> {
  const usuario = await usuarioDeLaSesion();
  if (!usuario) redirect(RUTA_LOGIN);
  return usuario.empresaId;
}
