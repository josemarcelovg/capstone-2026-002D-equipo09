"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  TIPOS,
  validarVehiculo,
  type DatosVehiculo,
  type ErroresVehiculo,
  type Vehiculo,
} from "@/lib/vehiculos";
import { guardarVehiculo } from "./acciones";

const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-invalid:border-red-600";

function Campo({
  nombre,
  etiqueta,
  error,
  opcional = false,
  ancho = false,
  children,
}: {
  nombre: string;
  etiqueta: string;
  error?: string;
  opcional?: boolean;
  ancho?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={ancho ? "sm:col-span-2" : undefined}>
      <label htmlFor={nombre} className="text-sm font-medium text-zinc-800">
        {etiqueta}
        {opcional && <span className="font-normal text-zinc-500"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${nombre}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Formulario de registro (sin `vehiculo`) y de edición (con `vehiculo`). */
export function VehiculoForm({ vehiculo }: { vehiculo?: Vehiculo }) {
  const [errores, setErrores] = useState<ErroresVehiculo>({});
  const [guardando, iniciarGuardado] = useTransition();

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const mostrar = (nuevos: ErroresVehiculo) => {
      setErrores(nuevos);
      const primero = formulario.elements.namedItem(Object.keys(nuevos)[0]);
      if (primero instanceof HTMLElement) primero.focus();
    };

    // Primero en el navegador para ayudar al usuario; el servidor valida de nuevo.
    const resultado = validarVehiculo(Object.fromEntries(datos));
    if (!resultado.ok) return mostrar(resultado.errores);

    iniciarGuardado(async () => {
      const delServidor = await guardarVehiculo(vehiculo?.id ?? null, datos);
      if (delServidor) mostrar(delServidor);
    });
  }

  const control = (nombre: keyof DatosVehiculo) => ({
    id: nombre,
    name: nombre,
    className: CONTROL,
    defaultValue: vehiculo?.[nombre] ?? "",
    "aria-invalid": Boolean(errores[nombre]),
    "aria-describedby": errores[nombre] ? `${nombre}-error` : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="patente" etiqueta="Patente" error={errores.patente}>
          <input
            {...control("patente")}
            placeholder="BBCD12"
            maxLength={10}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
        </Campo>

        <Campo nombre="tipo" etiqueta="Tipo" error={errores.tipo}>
          <select {...control("tipo")}>
            <option value="">Selecciona un tipo</option>
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETA_TIPO[tipo]}
              </option>
            ))}
          </select>
        </Campo>

        <Campo nombre="marca" etiqueta="Marca" error={errores.marca}>
          <input {...control("marca")} placeholder="Mercedes-Benz" maxLength={50} />
        </Campo>

        <Campo nombre="modelo" etiqueta="Modelo" error={errores.modelo}>
          <input {...control("modelo")} placeholder="Sprinter 515" maxLength={50} />
        </Campo>

        <Campo nombre="anio" etiqueta="Año" error={errores.anio}>
          <input {...control("anio")} inputMode="numeric" maxLength={4} />
        </Campo>

        <Campo
          nombre="capacidadPasajeros"
          etiqueta="Capacidad de pasajeros"
          error={errores.capacidadPasajeros}
        >
          <input {...control("capacidadPasajeros")} inputMode="numeric" maxLength={3} />
        </Campo>

        <Campo
          nombre="numeroInterno"
          etiqueta="Número interno"
          error={errores.numeroInterno}
          opcional
        >
          <input {...control("numeroInterno")} maxLength={20} />
        </Campo>

        <Campo nombre="color" etiqueta="Color" error={errores.color} opcional>
          <input {...control("color")} maxLength={30} />
        </Campo>

        {vehiculo?.estado === "inactivo" ? (
          // Un vehículo inactivo solo cambia de estado con el botón "Reactivar".
          <input type="hidden" name="estado" value="inactivo" />
        ) : (
          <Campo nombre="estado" etiqueta="Estado" error={errores.estado}>
            <select {...control("estado")} defaultValue={vehiculo?.estado ?? "activo"}>
              <option value="activo">{ETIQUETA_ESTADO.activo}</option>
              <option value="en_mantencion">{ETIQUETA_ESTADO.en_mantencion}</option>
            </select>
          </Campo>
        )}

        <Campo
          nombre="observaciones"
          etiqueta="Observaciones"
          error={errores.observaciones}
          opcional
          ancho
        >
          <textarea {...control("observaciones")} rows={3} maxLength={500} />
        </Campo>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/vehiculos"
          className="rounded-md border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : vehiculo ? "Guardar cambios" : "Registrar vehículo"}
        </button>
      </div>
    </form>
  );
}
