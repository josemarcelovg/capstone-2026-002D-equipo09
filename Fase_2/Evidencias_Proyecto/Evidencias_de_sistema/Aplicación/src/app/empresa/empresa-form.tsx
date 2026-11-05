"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { formatearTelefono } from "@/lib/conductores";
import {
  cambiaElCorreo,
  validarEmpresa,
  type DatosEmpresa,
  type ErroresEmpresa,
} from "@/lib/empresa";
import { formatearRut } from "@/lib/rut";
import { guardarEmpresa } from "./acciones";

const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-invalid:border-red-600 read-only:bg-zinc-100 read-only:text-zinc-600";

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

/** Datos de contacto de la empresa de la sesión (PB-14). */
export function EmpresaForm({ empresa }: { empresa: DatosEmpresa }) {
  const [errores, setErrores] = useState<ErroresEmpresa>({});
  const [guardando, iniciarGuardado] = useTransition();
  const tieneRut = Boolean(empresa.rut);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const mostrar = (nuevos: ErroresEmpresa) => {
      setErrores(nuevos);
      const primero = formulario.elements.namedItem(Object.keys(nuevos)[0]);
      if (primero instanceof HTMLElement) primero.focus();
    };

    // Primero en el navegador para ayudar al usuario; el servidor valida de nuevo.
    const resultado = validarEmpresa(Object.fromEntries(datos), empresa.rut);
    if (!resultado.ok) return mostrar(resultado.errores);

    // Ese correo recibe las alertas: un error al escribirlo hace que dejen de llegar.
    const correo = resultado.datos.emailContacto;
    if (
      cambiaElCorreo(empresa.emailContacto, correo) &&
      !window.confirm(`Las alertas de vencimiento llegarán a ${correo}. ¿Confirmas?`)
    ) {
      return;
    }

    iniciarGuardado(async () => {
      const delServidor = await guardarEmpresa(datos);
      if (delServidor) mostrar(delServidor);
    });
  }

  const control = (nombre: keyof DatosEmpresa, valor: string, ayuda = false) => ({
    id: nombre,
    name: nombre,
    className: CONTROL,
    defaultValue: valor,
    "aria-invalid": Boolean(errores[nombre]),
    "aria-describedby": errores[nombre] ? `${nombre}-error` : ayuda ? `${nombre}-ayuda` : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="nombre" etiqueta="Nombre de la empresa" error={errores.nombre}>
          <input {...control("nombre", empresa.nombre)} maxLength={100} autoComplete="organization" />
        </Campo>

        <Campo
          nombre="emailContacto"
          etiqueta="Correo de contacto"
          error={errores.emailContacto}
          ayuda="Aquí llegan las alertas de vencimiento."
        >
          <input
            {...control("emailContacto", empresa.emailContacto, true)}
            type="email"
            maxLength={254}
            autoComplete="email"
            spellCheck={false}
          />
        </Campo>

        <Campo
          nombre="telefono"
          etiqueta="Teléfono"
          error={errores.telefono}
          ayuda="9 dígitos, por ejemplo 9 1234 5678."
          opcional
        >
          <input
            {...control("telefono", empresa.telefono ? formatearTelefono(empresa.telefono) : "", true)}
            type="tel"
            maxLength={20}
            autoComplete="tel"
          />
        </Campo>

        <Campo
          nombre="rut"
          etiqueta="RUT de la empresa"
          error={errores.rut}
          ayuda={
            tieneRut
              ? "El RUT no se puede cambiar. Si está mal, escríbenos."
              : "Con o sin puntos. Una vez guardado, no se puede cambiar."
          }
          opcional={!tieneRut}
        >
          <input
            {...control("rut", empresa.rut ? formatearRut(empresa.rut) : "", true)}
            readOnly={tieneRut}
            placeholder={tieneRut ? undefined : "76.543.210-K"}
            maxLength={20}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
        </Campo>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
