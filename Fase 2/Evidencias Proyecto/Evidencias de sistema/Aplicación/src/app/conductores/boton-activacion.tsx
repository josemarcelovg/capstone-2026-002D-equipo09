"use client";

import { useState, useTransition } from "react";
import { cambiarActivacion } from "./acciones";

/**
 * Desactiva (pidiendo confirmación) o reactiva un conductor. Si tiene vehículos asignados, la
 * confirmación avisa que quedarán sin conductor (PB-24, criterio 4).
 */
export function BotonActivacion({
  id,
  nombre,
  inactivo,
  vehiculosAsignados = 0,
}: {
  id: string;
  nombre: string;
  inactivo: boolean;
  vehiculosAsignados?: number;
}) {
  const [cambiando, iniciarCambio] = useTransition();
  const [error, setError] = useState<string>();

  function cambiar() {
    const vehiculos =
      vehiculosAsignados === 1
        ? " y su vehículo quedará sin conductor asignado"
        : vehiculosAsignados > 1
          ? ` y sus ${vehiculosAsignados} vehículos quedarán sin conductor asignado`
          : "";
    const pregunta = `¿Desactivar a ${nombre}? Dejará de aparecer en el listado${vehiculos}`;
    if (!inactivo && !window.confirm(pregunta)) return;
    iniciarCambio(async () => setError(await cambiarActivacion(id, inactivo)));
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={cambiar}
        disabled={cambiando}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60 sm:w-auto ${
          inactivo
            ? "border-emerald-700 text-emerald-800 hover:bg-emerald-50"
            : "border-red-700 text-red-800 hover:bg-red-50"
        }`}
      >
        {inactivo ? "Reactivar conductor" : "Desactivar conductor"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
