"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-invalid:border-red-600";

const INICIAL: EstadoLogin = { errores: {}, correo: "" };

export function FormularioLogin() {
  const [{ errores, correo }, enviar, enviando] = useActionState(iniciarSesion, INICIAL);

  return (
    <form action={enviar} noValidate className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4">
        <div>
          <label htmlFor="correo" className="text-sm font-medium text-zinc-800">
            Correo
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={correo}
            aria-invalid={Boolean(errores.correo)}
            aria-describedby={errores.correo ? "correo-error" : undefined}
            className={CONTROL}
          />
          {errores.correo && (
            <p id="correo-error" className="mt-1 text-sm text-red-700">
              {errores.correo}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contrasena" className="text-sm font-medium text-zinc-800">
            Contraseña
          </label>
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errores.contrasena)}
            aria-describedby={errores.contrasena ? "contrasena-error" : undefined}
            className={CONTROL}
          />
          {errores.contrasena && (
            <p id="contrasena-error" className="mt-1 text-sm text-red-700">
              {errores.contrasena}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="mt-6 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
