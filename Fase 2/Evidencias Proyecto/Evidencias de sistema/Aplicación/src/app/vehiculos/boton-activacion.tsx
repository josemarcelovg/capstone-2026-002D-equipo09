"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
import { cambiarActivacion } from "./acciones";

// Botón para desactivar (con confirmación) o reactivar un vehículo. La confirmación avisa
// cuántos turnos tiene desde hoy, si tiene.
export function BotonActivacion({
  id,
  patente,
  inactivo,
  avisoTurnos,
}: {
  id: string;
  patente: string;
  inactivo: boolean;
  avisoTurnos?: string | null;
}) {
  const [cambiando, iniciarCambio] = useTransition();
  const [error, setError] = useState<string>();

  function cambiar() {
    const pregunta = [`¿Desactivar el vehículo ${patente}? Dejará de aparecer en el listado`, avisoTurnos]
      .filter(Boolean)
      .join(".\n\n");
    if (!inactivo && !window.confirm(pregunta)) return;
    iniciarCambio(async () =>
      setError(await llamarAlServidor(() => cambiarActivacion(id, inactivo), SIN_CONEXION, unstable_rethrow)),
    );
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
        {inactivo ? "Reactivar vehículo" : "Desactivar vehículo"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
