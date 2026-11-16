import { Insignia, type Tono } from "../insignia";

export const tonoConductor = (activo: boolean): Tono => (activo ? "verde" : "gris");

export function InsigniaEstado({ activo }: { activo: boolean }) {
  return <Insignia tono={tonoConductor(activo)}>{activo ? "Activo" : "Inactivo"}</Insignia>;
}
