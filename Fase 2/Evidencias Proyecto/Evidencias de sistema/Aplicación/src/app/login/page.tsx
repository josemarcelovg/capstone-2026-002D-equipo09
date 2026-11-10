import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { accesoDelEntorno } from "@/lib/acceso";
import { usuarioDeLaSesion } from "@/lib/sesion";
import { IconoDocumento, IconoEscudo } from "../iconos";
import { Logo } from "../logo";
import fotoFlota from "./foto-flota.jpg";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function PaginaLogin() {
  await connection();
  // En desarrollo sin Supabase no hay inicio de sesión: se trabaja con EMPRESA_DESARROLLO_ID.
  if (accesoDelEntorno().modo === "desarrollo") redirect("/vehiculos");
  if (await usuarioDeLaSesion()) redirect("/vehiculos");

  return (
    <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl md:min-h-[620px] md:grid-cols-2">
      {/* Izquierda en computador (arriba en celular): la foto de la flota con la marca encima. */}
      <section className="relative flex min-h-48 flex-col justify-between overflow-hidden bg-stone-900 p-6 text-white md:p-10">
        <Image
          src={fotoFlota}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[62%_center]"
        />
        {/* Capas de color sobre la foto, para que el texto se lea y combine con el naranja. */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-stone-950/90 from-15% via-stone-950/55 via-55% to-stone-950/95" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-orange-700/45 via-transparent to-transparent" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-orange-600" />

        <div className="relative">
          <Logo claro />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300 md:mt-12">
            Gestión de flotas de transporte
          </p>
          <p className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Tu flota,
            <br />
            siempre en orden.
          </p>
          <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-stone-200 md:block">
            Centraliza tus vehículos, organiza a tus conductores y mantén sus documentos al día.
          </p>
        </div>

        <div className="relative hidden md:block">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-stone-950/60 p-4 backdrop-blur-sm">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white">
              <IconoDocumento className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Documentos al día</p>
              <p className="text-xs text-stone-300">Avisos por correo antes de cada vencimiento</p>
              <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-white/15">
                <div className="h-1.5 w-2/3 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-stone-400">MicroLogist · Gestión de transporte</p>
        </div>
      </section>

      {/* Derecha: el formulario. */}
      <section className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
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
