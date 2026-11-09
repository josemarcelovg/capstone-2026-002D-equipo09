import type { Metadata } from "next";
import Link from "next/link";
import { opcionesDeDueno } from "../../documentos/opciones";
import { VehiculoForm } from "../vehiculo-form";

export const metadata: Metadata = { title: "Registrar vehículo" };

export default async function PaginaNuevoVehiculo() {
  // Los conductores activos de la empresa, para elegir el conductor asignado (PB-24).
  const { conductores } = await opcionesDeDueno("conductor");

  return (
    <>
      <Link href="/vehiculos" className="text-sm font-medium text-blue-800 hover:underline">
        ← Volver al listado
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-semibold text-zinc-900">Registrar vehículo</h1>
      <VehiculoForm conductores={conductores} />
    </>
  );
}
