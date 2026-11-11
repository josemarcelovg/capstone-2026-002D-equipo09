import { Insignia, type Tono } from "../insignia";

export const tonoConductor = (activo: boolean): Tono => (activo ? "verde" : "gris");

// El estado se lee en el texto, no solo en el color (RNF-USA-06).
export function InsigniaEstado({ activo }: { activo: boolean }) {
  return <Insignia tono={tonoConductor(activo)}>{activo ? "Activo" : "Inactivo"}</Insignia>;
}
