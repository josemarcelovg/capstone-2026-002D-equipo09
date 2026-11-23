// Pantalla de carga solo de la vista del día, para que un turno que no existe responda 404.
export default function Cargando() {
  return (
    <p role="status" className="flex items-center justify-center gap-3 py-12 text-stone-600">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-700"
      />
      Cargando turnos…
    </p>
  );
}
