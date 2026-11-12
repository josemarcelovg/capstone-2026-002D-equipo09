"use client";

import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
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
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL } from "../estilos";


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
      <label htmlFor={nombre} className="text-sm font-medium text-stone-800">
        {etiqueta}
        {opcional && <span className="font-normal text-stone-500"> (opcional)</span>}
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

/**
 * Formulario de registro (sin `vehiculo`) y de edición (con `vehiculo`). `conductores` son los
 * conductores activos de la empresa que se pueden asignar (PB-24, criterio 2).
 */
export function VehiculoForm({
  vehiculo,
  conductores,
}: {
  vehiculo?: Vehiculo;
  conductores: { id: string; nombre: string }[];
}) {
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
      const delServidor = await llamarAlServidor(
        () => guardarVehiculo(vehiculo?.id ?? null, datos),
        { general: SIN_CONEXION },
        unstable_rethrow,
      );
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
    <form onSubmit={enviar} noValidate className="rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
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

        <Campo nombre="conductorId" etiqueta="Conductor asignado" error={errores.conductorId} opcional>
          <select {...control("conductorId")}>
            <option value="">Sin conductor asignado</option>
            {conductores.map((conductor) => (
              <option key={conductor.id} value={conductor.id}>
                {conductor.nombre}
              </option>
            ))}
          </select>
        </Campo>

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
          className={BOTON_SECUNDARIO}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className={BOTON_PRINCIPAL}
        >
          {guardando ? "Guardando…" : vehiculo ? "Guardar cambios" : "Registrar vehículo"}
        </button>
      </div>
    </form>
  );
}
