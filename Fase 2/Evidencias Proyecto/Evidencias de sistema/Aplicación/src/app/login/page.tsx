import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { accesoDelEntorno } from "@/lib/acceso";
import { usuarioDeLaSesion } from "@/lib/sesion";
import { IconoDocumento, IconoEscudo } from "../iconos";
import { Logo } from "../logo";
import { FormularioLogin } from "./formulario-login";
import { IlustracionFlota } from "./ilustracion-flota";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function PaginaLogin() {
  await connection();
  // En desarrollo sin Supabase no hay inicio de sesión: se trabaja con EMPRESA_DESARROLLO_ID.
  if (accesoDelEntorno().modo === "desarrollo") redirect("/vehiculos");
  if (await usuarioDeLaSesion()) redirect("/vehiculos");

  return (
    <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl md:min-h-[620px] md:grid-cols-2">
      {/* Izquierda (computador): la marca, para qué sirve y el dibujo de la flota. */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-stone-900 p-10 text-white md:flex">
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-orange-600/15" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-20 size-80 rounded-full bg-orange-600/10" />

        <div className="relative">
          <Logo claro />
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            Gestión de flotas de transporte
          </p>
          <p className="mt-3 text-4xl font-bold leading-tight tracking-tight">
            Tu flota,
            <br />
            siempre en orden.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-300">
            Centraliza tus vehículos, organiza a tus conductores y mantén sus documentos al día.
          </p>
        </div>

        <div className="relative">
          <IlustracionFlota className="w-full" />
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400">
              <IconoDocumento className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Documentos al día</p>
              <p className="text-xs text-stone-400">Avisos por correo antes de cada vencimiento</p>
              <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 w-2/3 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-stone-500">MicroLogist · Gestión de transporte</p>
        </div>
      </section>

      {/* Derecha: el formulario. En celular es lo único que se ve, con el logo arriba. */}
      <section className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Logo grande />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Hola de nuevo</h1>
          <p className="mt-1 text-sm text-stone-600">
            Ingresa con el correo y la contraseña de tu empresa.
          </p>

          <FormularioLogin />

          <div className="mt-8 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-stone-500">
            <span aria-hidden="true" className="h-px flex-1 bg-stone-200" />
            <span className="inline-flex items-center gap-1.5">
              <IconoEscudo className="size-4" />
              Acceso seguro
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-stone-200" />
          </div>
          <p className="mt-4 text-center text-sm text-stone-600">¿Necesitas una cuenta?</p>
          <p className="text-center text-sm font-semibold text-orange-800">
            Pídesela al administrador de tu empresa
          </p>
          <p className="mt-8 text-center text-xs text-stone-500">© 2026 MicroLogist</p>
        </div>
      </section>
    </div>
  );
}
