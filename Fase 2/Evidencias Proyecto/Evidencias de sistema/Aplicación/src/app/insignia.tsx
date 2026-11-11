import type { ReactNode } from "react";

export type Tono = "verde" | "amarillo" | "rojo" | "gris";

const COLORES: Record<Tono, { fondo: string; punto: string }> = {
  verde: { fondo: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", punto: "bg-emerald-500" },
  amarillo: { fondo: "bg-amber-50 text-amber-900 ring-amber-600/25", punto: "bg-amber-500" },
  rojo: { fondo: "bg-red-50 text-red-800 ring-red-600/20", punto: "bg-red-500" },
  gris: { fondo: "bg-stone-100 text-stone-700 ring-stone-500/20", punto: "bg-stone-400" },
};

/**
 * Insignia de estado con un punto de color. El estado siempre se lee en el texto, no solo en
 * el color (RNF-USA-06).
 */
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
