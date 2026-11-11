import Link from "next/link";
import { formatearPatente, type Vehiculo } from "@/lib/vehiculos";

/**
 * Los vehículos de los que es el conductor habitual (PB-24). Se asignan desde la ficha de cada
 * vehículo; un conductor puede tener varios.
 */
export function VehiculosAsignados({
  vehiculos,
}: {
  vehiculos: Pick<Vehiculo, "id" | "patente" | "estado">[];
}) {
  return (
    <section
      aria-labelledby="titulo-vehiculos"
      className="mt-6 rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6"
    >
      <h2 id="titulo-vehiculos" className="border-l-4 border-orange-600 pl-3 text-lg font-semibold text-stone-900">
        Vehículos asignados
      </h2>
      {vehiculos.length === 0 ? (
        <p className="mt-2 text-sm text-stone-700">
          No tiene vehículos asignados. Se asignan desde la ficha de cada vehículo.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {vehiculos.map((vehiculo) => (
            <li key={vehiculo.id}>
              <Link
                href={`/vehiculos/${vehiculo.id}`}
                className="font-mono font-medium text-orange-800 hover:underline"
              >
                {formatearPatente(vehiculo.patente)}
              </Link>
              {vehiculo.estado !== "activo" && (
                <span className="text-sm text-stone-600">
                  {" "}
                  ({vehiculo.estado === "inactivo" ? "inactivo" : "en mantención"})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
