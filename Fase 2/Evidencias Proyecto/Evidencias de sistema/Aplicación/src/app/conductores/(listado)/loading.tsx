// Está dentro del grupo (listado) para que solo envuelva el listado: si envolviera también
// la ficha, un conductor inexistente o de otra empresa respondería 200 en vez de 404.
export default function Cargando() {
  return (
    <p role="status" className="py-12 text-center text-zinc-600">
      Cargando conductores…
    </p>
  );
}
