"use client";

import { useActionState, useState } from "react";
import { BOTON_PRINCIPAL, CONTROL } from "../estilos";
import { IconoOjo, IconoOjoTachado } from "../iconos";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const INICIAL: EstadoLogin = { errores: {}, correo: "" };

export function FormularioLogin() {
  const [{ errores, correo }, enviar, enviando] = useActionState(iniciarSesion, INICIAL);
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <form action={enviar} noValidate className="mt-8">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-5">
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
            placeholder="nombre@empresa.cl"
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
          <div className="relative">
            <input
              id="contrasena"
              name="contrasena"
              type={verContrasena ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={Boolean(errores.contrasena)}
              aria-describedby={errores.contrasena ? "contrasena-error" : undefined}
              className={`${CONTROL} pr-11`}
            />
            {/* Muestra u oculta la contraseña para revisar lo que se escribió. */}
            <button
              type="button"
              onClick={() => setVerContrasena((ver) => !ver)}
              aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={verContrasena}
              className="absolute right-1.5 top-1/2 mt-0.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            >
              {verContrasena ? <IconoOjoTachado className="size-5" /> : <IconoOjo className="size-5" />}
            </button>
          </div>
          {errores.contrasena && (
            <p id="contrasena-error" className="mt-1 text-sm text-red-700">
              {errores.contrasena}
            </p>
          )}
        </div>
      </div>

      <button type="submit" disabled={enviando} className={`${BOTON_PRINCIPAL} mt-7 w-full`}>
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="mt-3 text-center text-xs text-stone-500">
        ¿Olvidaste tu contraseña? Pídele al administrador de tu empresa que la restablezca.
      </p>
    </form>
  );
}
