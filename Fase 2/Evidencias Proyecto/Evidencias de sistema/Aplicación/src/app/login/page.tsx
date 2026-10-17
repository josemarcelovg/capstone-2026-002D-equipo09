import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { accesoDelEntorno } from "@/lib/acceso";
import { usuarioDeLaSesion } from "@/lib/sesion";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function PaginaLogin() {
  await connection();
  // En desarrollo sin Supabase no hay inicio de sesión: se trabaja con EMPRESA_DESARROLLO_ID.
  if (accesoDelEntorno().modo === "desarrollo") redirect("/vehiculos");
  if (await usuarioDeLaSesion()) redirect("/vehiculos");

  return (
    <div className="mx-auto mt-4 w-full max-w-sm sm:mt-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Ingresa con el correo y la contraseña de tu empresa.
      </p>
      <FormularioLogin />
    </div>
  );
}
