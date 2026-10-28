"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  formatearTelefono,
  validarConductor,
  type Conductor,
  type DatosConductor,
  type ErroresConductor,
} from "@/lib/conductores";
import { formatearRut } from "@/lib/rut";
import { guardarConductor } from "./acciones";

const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-invalid:border-red-600";

function Campo({
  nombre,
  etiqueta,
  error,
  ayuda,
  opcional = false,
  children,
}: {
  nombre: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  opcional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={nombre} className="text-sm font-medium text-zinc-800">
        {etiqueta}
        {opcional && <span className="font-normal text-zinc-500"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${nombre}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${nombre}-ayuda`} className="mt-1 text-xs text-zinc-600">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

// Lo que se muestra en el formulario al editar: RUT con puntos y teléfono con espacios.
const VALOR_INICIAL: Record<keyof DatosConductor, (conductor: Conductor) => string> = {
  nombre: (conductor) => conductor.nombre,
  rut: (conductor) => formatearRut(conductor.rut),
  telefono: (conductor) => formatearTelefono(conductor.telefono),
  email: (conductor) => conductor.email ?? "",
};

/** Formulario de registro (sin `conductor`) y de edición (con `conductor`). */
export function ConductorForm({ conductor }: { conductor?: Conductor }) {
  const [errores, setErrores] = useState<ErroresConductor>({});
  const [guardando, iniciarGuardado] = useTransition();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const mostrar = (nuevos: ErroresConductor) => {
      setErrores(nuevos);
      const primero = formulario.elements.namedItem(Object.keys(nuevos)[0]);
      if (primero instanceof HTMLElement) primero.focus();
    };

    // Primero en el navegador para ayudar al usuario; el servidor valida de nuevo.
    const resultado = validarConductor(Object.fromEntries(datos));
    if (!resultado.ok) return mostrar(resultado.errores);

    iniciarGuardado(async () => {
      const delServidor = await guardarConductor(conductor?.id ?? null, datos);
      if (delServidor) mostrar(delServidor);
    });
  }

  const control = (nombre: keyof DatosConductor, ayuda?: boolean) => ({
    id: nombre,
    name: nombre,
    className: CONTROL,
    defaultValue: conductor ? VALOR_INICIAL[nombre](conductor) : "",
    "aria-invalid": Boolean(errores[nombre]),
    "aria-describedby": errores[nombre]
      ? `${nombre}-error`
      : ayuda
        ? `${nombre}-ayuda`
        : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="nombre" etiqueta="Nombre completo" error={errores.nombre}>
          <input {...control("nombre")} placeholder="Juan Pérez" maxLength={100} autoComplete="off" />
        </Campo>

        <Campo nombre="rut" etiqueta="RUT" error={errores.rut} ayuda="Con o sin puntos, por ejemplo 12.345.678-9.">
          <input
            {...control("rut", true)}
            placeholder="12.345.678-9"
            maxLength={20}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </Campo>

        <Campo nombre="telefono" etiqueta="Teléfono" error={errores.telefono} ayuda="9 dígitos, por ejemplo 9 1234 5678.">
          <input
            {...control("telefono", true)}
            type="tel"
            placeholder="9 1234 5678"
            maxLength={20}
            autoComplete="off"
          />
        </Campo>

        <Campo nombre="email" etiqueta="Correo" error={errores.email} opcional>
          <input
            {...control("email")}
            type="email"
            placeholder="nombre@correo.cl"
            maxLength={254}
            autoComplete="off"
            spellCheck={false}
          />
        </Campo>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/conductores"
          className="rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : conductor ? "Guardar cambios" : "Registrar conductor"}
        </button>
      </div>
    </form>
  );
}
