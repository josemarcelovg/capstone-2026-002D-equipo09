import { ETIQUETA_ESTADO, type Estado } from "@/lib/vehiculos";

const COLORES: Record<Estado, string> = {
  activo: "bg-emerald-100 text-emerald-800",
  en_mantencion: "bg-amber-100 text-amber-900",
  inactivo: "bg-zinc-200 text-zinc-700",
};

export function InsigniaEstado({ estado }: { estado: Estado }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORES[estado]}`}
    >
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}
