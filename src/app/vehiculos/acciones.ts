"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatearPatente, validarVehiculo, type ErroresVehiculo } from "@/lib/vehiculos";
import { actualizarVehiculo, buscarPorPatente, crearVehiculo } from "@/lib/vehiculos-datos";

/**
 * Registra un vehículo (`id` nulo) o guarda los cambios de uno existente.
 * Si todo sale bien vuelve al listado; si no, devuelve un error por campo.
 */
export async function guardarVehiculo(
  id: string | null,
  formulario: FormData,
): Promise<ErroresVehiculo> {
  const resultado = validarVehiculo(Object.fromEntries(formulario));
  if (!resultado.ok) return resultado.errores;
  const { datos } = resultado;

  try {
    const mismaPatente = await buscarPorPatente(datos.patente);
    if (mismaPatente && mismaPatente.id !== id) {
      return {
        patente: `Ya tienes un vehículo registrado con la patente ${formatearPatente(datos.patente)}.`,
      };
    }
    const guardado = id ? await actualizarVehiculo(id, datos) : await crearVehiculo(datos);
    if (!guardado) return { general: "No encontramos el vehículo. Vuelve al listado." };
  } catch {
    return { general: "No pudimos guardar el vehículo. Intenta nuevamente." };
  }

  revalidatePath("/vehiculos");
  redirect(`/vehiculos?mensaje=${id ? "actualizado" : "creado"}`);
}

/** Desactiva (`activar` falso) o reactiva un vehículo. Nunca se elimina. */
export async function cambiarActivacion(id: string, activar: boolean) {
  const vehiculo = await actualizarVehiculo(id, { estado: activar ? "activo" : "inactivo" });
  revalidatePath("/vehiculos");
  if (!vehiculo) redirect("/vehiculos");
  redirect(`/vehiculos?mensaje=${activar ? "reactivado" : "desactivado"}`);
}
