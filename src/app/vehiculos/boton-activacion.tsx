"use client";

import { useTransition } from "react";
import { cambiarActivacion } from "./acciones";

/** Desactiva (pidiendo confirmación) o reactiva un vehículo. */
export function BotonActivacion({
  id,
  patente,
  inactivo,
}: {
  id: string;
  patente: string;
  inactivo: boolean;
}) {
  const [cambiando, iniciarCambio] = useTransition();

  function cambiar() {
    const pregunta = `¿Desactivar el vehículo ${patente}? Dejará de aparecer en el listado`;
    if (!inactivo && !window.confirm(pregunta)) return;
    iniciarCambio(() => cambiarActivacion(id, inactivo));
  }

  return (
    <button
      type="button"
      onClick={cambiar}
      disabled={cambiando}
      className={`w-full rounded-md border px-4 py-2.5 text-sm font-medium disabled:opacity-60 sm:w-auto ${
        inactivo
          ? "border-emerald-700 text-emerald-800 hover:bg-emerald-50"
          : "border-red-700 text-red-800 hover:bg-red-50"
      }`}
    >
      {inactivo ? "Reactivar vehículo" : "Desactivar vehículo"}
    </button>
  );
}
