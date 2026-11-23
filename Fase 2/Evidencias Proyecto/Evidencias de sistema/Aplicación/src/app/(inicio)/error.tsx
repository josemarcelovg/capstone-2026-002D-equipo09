"use client";

import { useEffect } from "react";
import { IconoAlerta } from "../iconos";

// Pantalla de error del resumen, sin mostrar detalles técnicos (JOA-50, sección 4).
export default function ErrorInicio({
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
    <div role="alert" className="rounded-xl border border-stone-200 bg-white shadow-sm px-4 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-700">
        <IconoAlerta className="size-6" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">No pudimos cargar el resumen</h1>
      <p className="mt-2 text-stone-700">Intenta nuevamente.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-800"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
