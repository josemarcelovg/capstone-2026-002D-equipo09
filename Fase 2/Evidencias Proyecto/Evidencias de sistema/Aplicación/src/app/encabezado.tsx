import type { ReactNode } from "react";

/**
 * Título de una pantalla con una línea que explica para qué sirve y, a la derecha, sus
 * acciones (por ejemplo, el botón para registrar). En celular las acciones van debajo.
 */
export function Encabezado({
  titulo,
  descripcion,
  children,
}: {
  titulo: ReactNode;
  descripcion?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-stone-600">{descripcion}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Mensaje de confirmación después de guardar, desactivar o reactivar. */
export function MensajeExito({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900"
    >
      {children}
    </p>
  );
}
