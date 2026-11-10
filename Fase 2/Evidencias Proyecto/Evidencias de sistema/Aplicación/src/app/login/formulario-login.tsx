"use client";

import { useActionState } from "react";
import { BOTON_PRINCIPAL, CONTROL } from "../estilos";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const INICIAL: EstadoLogin = { errores: {}, correo: "" };

export function FormularioLogin() {
  const [{ errores, correo }, enviar, enviando] = useActionState(iniciarSesion, INICIAL);

  return (
    <form action={enviar} noValidate className="mt-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4">
        <div>
          <label htmlFor="correo" className="text-sm font-medium text-stone-800">
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
          <label htmlFor="contrasena" className="text-sm font-medium text-stone-800">
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
        className={`${BOTON_PRINCIPAL} mt-6 w-full`}
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
