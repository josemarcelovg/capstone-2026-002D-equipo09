import { listarConductores } from "@/lib/conductores-datos";
import type { DuenoDocumento, TipoDueno } from "@/lib/documentos";
import { formatearRut } from "@/lib/rut";
import { formatearPatente } from "@/lib/vehiculos";
import { listarVehiculos } from "@/lib/vehiculos-datos";
import type { OpcionDueno } from "./documento-form";

// Vehículos y conductores activos de la empresa, para elegir en el formulario.
export async function opcionesDeDueno(
  tipo?: TipoDueno,
  actual?: DuenoDocumento,
): Promise<{ vehiculos: OpcionDueno[]; conductores: OpcionDueno[] }> {
  const [vehiculos, conductores] = await Promise.all([
    tipo === "conductor" ? [] : listarVehiculos(),
    tipo === "vehiculo" ? [] : listarConductores(),
  ]);
  const opciones = {
    vehiculos: vehiculos.map((vehiculo) => ({
      id: vehiculo.id,
      nombre: `${formatearPatente(vehiculo.patente)} · ${vehiculo.marca} ${vehiculo.modelo}`,
    })),
    conductores: conductores.map((conductor) => ({
      id: conductor.id,
      nombre: `${conductor.nombre} · ${formatearRut(conductor.rut)}`,
    })),
  };
  if (actual && !actual.activo) {
    const lista = actual.tipo === "vehiculo" ? opciones.vehiculos : opciones.conductores;
    lista.unshift({ id: actual.id, nombre: `${actual.nombre} (inactivo)` });
  }
  return opciones;
}
