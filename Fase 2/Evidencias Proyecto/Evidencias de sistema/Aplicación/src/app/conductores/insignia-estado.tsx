// El estado se lee en el texto, no solo en el color (RNF-USA-06).
export function InsigniaEstado({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        activo ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
