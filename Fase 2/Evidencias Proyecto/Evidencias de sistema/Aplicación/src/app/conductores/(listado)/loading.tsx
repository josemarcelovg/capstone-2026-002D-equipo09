// Está dentro del grupo (listado) para que solo envuelva el listado: si envolviera también
// la ficha, un conductor inexistente o de otra empresa respondería 200 en vez de 404.
export default function Cargando() {
  return (
    <p role="status" className="flex items-center justify-center gap-3 py-12 text-stone-600">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-700"
      />
      Cargando conductores…
    </p>
  );
}
