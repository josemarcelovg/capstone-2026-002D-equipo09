import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { accesoDelEntorno } from "@/lib/acceso";
import { usuarioDeLaSesion } from "@/lib/sesion";
import { IconoBus } from "../iconos";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function PaginaLogin() {
  await connection();
  // En desarrollo sin Supabase no hay inicio de sesión: se trabaja con EMPRESA_DESARROLLO_ID.
  if (accesoDelEntorno().modo === "desarrollo") redirect("/vehiculos");
  if (await usuarioDeLaSesion()) redirect("/vehiculos");

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 text-xl font-bold text-stone-900">
          <span className="flex size-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
            <IconoBus className="size-6" />
          </span>
          MicroLogist
        </div>
        <div className="mt-6 rounded-2xl border border-stone-200 border-t-4 border-t-orange-600 bg-white p-6 shadow-md sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-stone-600">
            Ingresa con el correo y la contraseña de tu empresa.
          </p>
          <FormularioLogin />
        </div>
        <p className="mt-6 text-center text-xs text-stone-500">
          Vehículos, conductores y documentos de tu flota en un solo lugar.
        </p>
      </div>
    </div>
  );
}
