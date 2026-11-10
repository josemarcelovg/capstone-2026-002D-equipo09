import { Insignia } from "../insignia";

// El estado se lee en el texto, no solo en el color (RNF-USA-06).
export function InsigniaEstado({ activo }: { activo: boolean }) {
  return <Insignia tono={activo ? "verde" : "gris"}>{activo ? "Activo" : "Inactivo"}</Insignia>;
}
