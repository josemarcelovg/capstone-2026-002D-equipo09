// Está dentro del grupo (listado) para que solo envuelva el listado. Si envolviera
// también el detalle, un vehículo inexistente o de otra empresa respondería con
// estado 200 en vez de 404, porque la respuesta ya habría empezado a enviarse.
export default function Cargando() {
  return (
    <p role="status" className="flex items-center justify-center gap-3 py-12 text-stone-600">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-700"
      />
      Cargando vehículos…
    </p>
  );
}
