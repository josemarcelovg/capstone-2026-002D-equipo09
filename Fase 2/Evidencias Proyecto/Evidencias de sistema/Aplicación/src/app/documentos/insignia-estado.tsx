import {
  calcularEstado,
  describirVencimiento,
  ETIQUETA_ESTADO_DOCUMENTO,
  type EstadoDocumento,
} from "@/lib/documentos";
import { IconoAlerta, IconoReloj, IconoVigente } from "../iconos";
import { Insignia, type Tono } from "../insignia";

const TONOS: Record<EstadoDocumento, Tono> = {
  vencido: "rojo",
  por_vencer: "amarillo",
  vigente: "verde",
};

// Color de la fila o tarjeta según el estado del documento.
export const tonoDocumento = (fechaVencimiento: string, hoy: string): Tono =>
  TONOS[calcularEstado(fechaVencimiento, hoy).estado];

const ICONOS: Record<EstadoDocumento, { Icono: typeof IconoAlerta; color: string }> = {
  vencido: { Icono: IconoAlerta, color: "bg-red-100 text-red-700" },
  por_vencer: { Icono: IconoReloj, color: "bg-amber-100 text-amber-800" },
  vigente: { Icono: IconoVigente, color: "bg-emerald-100 text-emerald-700" },
};

// Ícono del estado al lado del nombre del documento.
export function IconoEstadoDocumento({ fechaVencimiento, hoy }: { fechaVencimiento: string; hoy: string }) {
  const { Icono, color } = ICONOS[calcularEstado(fechaVencimiento, hoy).estado];
  return (
    <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
      <Icono className="size-5" />
    </span>
  );
}

// Estado del documento en texto, por ejemplo "Por vencer · Vence hoy".
export function InsigniaVencimiento({ fechaVencimiento, hoy }: { fechaVencimiento: string; hoy: string }) {
  const { estado } = calcularEstado(fechaVencimiento, hoy);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Insignia tono={TONOS[estado]}>{ETIQUETA_ESTADO_DOCUMENTO[estado]}</Insignia>
      {estado !== "vigente" && (
        <span
          className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium ${
            estado === "vencido" ? "text-red-700" : "text-amber-800"
          }`}
        >
          {estado === "vencido" ? <IconoAlerta className="size-4" /> : <IconoReloj className="size-4" />}
          {describirVencimiento(fechaVencimiento, hoy)}
        </span>
      )}
    </span>
  );
}
