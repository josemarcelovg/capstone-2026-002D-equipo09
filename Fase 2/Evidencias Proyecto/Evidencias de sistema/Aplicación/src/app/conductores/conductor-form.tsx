"use client";

import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
import {
  formatearTelefono,
  validarConductor,
  type Conductor,
  type DatosConductor,
  type ErroresConductor,
} from "@/lib/conductores";
import { formatearRut } from "@/lib/rut";
import { guardarConductor } from "./acciones";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL } from "../estilos";


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
      <label htmlFor={nombre} className="text-sm font-medium text-stone-800">
        {etiqueta}
        {opcional && <span className="font-normal text-stone-500"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${nombre}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${nombre}-ayuda`} className="mt-1 text-xs text-stone-600">
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
      const delServidor = await llamarAlServidor(
        () => guardarConductor(conductor?.id ?? null, datos),
        { general: SIN_CONEXION },
        unstable_rethrow,
      );
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
    <form onSubmit={enviar} noValidate className="rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
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
          className={BOTON_SECUNDARIO}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className={BOTON_PRINCIPAL}
        >
          {guardando ? "Guardando…" : conductor ? "Guardar cambios" : "Registrar conductor"}
        </button>
      </div>
    </form>
  );
}
