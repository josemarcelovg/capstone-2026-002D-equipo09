// Está dentro del grupo (listado) para que solo envuelva el listado. Si envolviera
// también el detalle, un vehículo inexistente o de otra empresa respondería con
// estado 200 en vez de 404, porque la respuesta ya habría empezado a enviarse.
export default function Cargando() {
  return (
    <p role="status" className="py-12 text-center text-zinc-600">
      Cargando vehículos…
    </p>
  );
}
