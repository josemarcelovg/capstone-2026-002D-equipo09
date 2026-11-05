import {
  calcularEstado,
  describirVencimiento,
  ETIQUETA_ESTADO_DOCUMENTO,
  type EstadoDocumento,
} from "@/lib/documentos";

const COLORES: Record<EstadoDocumento, string> = {
  vencido: "bg-red-100 text-red-800",
  por_vencer: "bg-amber-100 text-amber-900",
  vigente: "bg-emerald-100 text-emerald-800",
};

/**
 * "Vencido · Venció hace 3 días", "Por vencer · Vence hoy" o "Vigente". El estado se lee en el
 * texto y no solo en el color (RNF-USA-06). La fecha de un documento vigente ya se muestra al lado.
 */
export function InsigniaVencimiento({ fechaVencimiento, hoy }: { fechaVencimiento: string; hoy: string }) {
  const { estado } = calcularEstado(fechaVencimiento, hoy);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span
        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORES[estado]}`}
      >
        {ETIQUETA_ESTADO_DOCUMENTO[estado]}
      </span>
      {estado !== "vigente" && (
        <span className="whitespace-nowrap text-sm text-zinc-700">
          {describirVencimiento(fechaVencimiento, hoy)}
        </span>
      )}
    </span>
  );
}
