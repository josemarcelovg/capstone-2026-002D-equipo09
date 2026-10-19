"use client";

import { useEffect } from "react";

// Se muestra si falla la carga de una pantalla de vehículos (por ejemplo, sin conexión
// a la base de datos). No muestra detalles técnicos (RNF-SEG-09).
export default function ErrorVehiculos({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-lg border border-zinc-200 bg-white px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">No pudimos cargar los vehículos</h1>
      <p className="mt-2 text-zinc-700">Puede ser un problema de conexión. Intenta nuevamente.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
