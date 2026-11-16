import type { ReactNode } from "react";

export type Tono = "verde" | "amarillo" | "rojo" | "gris";

const COLORES: Record<Tono, { fondo: string; punto: string }> = {
  verde: { fondo: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", punto: "bg-emerald-500" },
  amarillo: { fondo: "bg-amber-50 text-amber-900 ring-amber-600/25", punto: "bg-amber-500" },
  rojo: { fondo: "bg-red-50 text-red-800 ring-red-600/20", punto: "bg-red-500" },
  gris: { fondo: "bg-stone-100 text-stone-700 ring-stone-500/20", punto: "bg-stone-400" },
};

// Barra de color al costado de una fila o tarjeta, según su estado.
export const BARRA_ESTADO: Record<Tono, string> = {
  verde: "border-l-4 border-l-emerald-500",
  amarillo: "border-l-4 border-l-amber-500",
  rojo: "border-l-4 border-l-red-500",
  gris: "border-l-4 border-l-stone-400",
};

// Etiqueta de estado con un punto de color y el texto.
export function Insignia({ tono, children }: { tono: Tono; children: ReactNode }) {
  const { fondo, punto } = COLORES[tono];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${fondo}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${punto}`} />
      {children}
    </span>
  );
}
