import { ETIQUETA_ESTADO, type Estado } from "@/lib/vehiculos";
import { Insignia, type Tono } from "../insignia";

export const TONOS: Record<Estado, Tono> = {
  activo: "verde",
  en_mantencion: "amarillo",
  inactivo: "gris",
};

export function InsigniaEstado({ estado }: { estado: Estado }) {
  return <Insignia tono={TONOS[estado]}>{ETIQUETA_ESTADO[estado]}</Insignia>;
}
