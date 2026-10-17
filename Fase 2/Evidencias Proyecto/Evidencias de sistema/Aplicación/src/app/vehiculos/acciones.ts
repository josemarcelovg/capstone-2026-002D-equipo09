"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { formatearPatente, validarVehiculo, type ErroresVehiculo } from "@/lib/vehiculos";
import {
  actualizarVehiculo,
  crearVehiculo,
  obtenerVehiculo,
  PatenteDuplicadaError,
} from "@/lib/vehiculos-datos";

const NO_ENCONTRADO = "No encontramos el vehículo. Vuelve al listado.";

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
    if (id) {
      const actual = await obtenerVehiculo(id);
      if (!actual) return { general: NO_ENCONTRADO };
      // Desactivar y reactivar solo con su botón, que pide confirmación (JOA-01, sección 4).
      if (actual.estado === "inactivo") datos.estado = "inactivo";
      else if (datos.estado === "inactivo") {
        return { estado: "Para desactivar el vehículo usa el botón «Desactivar vehículo»." };
      }
      if (!(await actualizarVehiculo(id, datos))) return { general: NO_ENCONTRADO };
    } else {
      await crearVehiculo(datos);
    }
  } catch (error) {
    // Sin sesión, empresaDeLaSesion() redirige al login (SIM-02): esa redirección no es un error.
    unstable_rethrow(error);
    if (error instanceof PatenteDuplicadaError) {
      return {
        patente: `Ya tienes un vehículo registrado con la patente ${formatearPatente(datos.patente)}.`,
      };
    }
    console.error(error);
    return { general: "No pudimos guardar el vehículo. Intenta nuevamente." };
  }

  revalidatePath("/vehiculos");
  redirect(`/vehiculos?mensaje=${id ? "actualizado" : "creado"}`);
}

/**
 * Desactiva (`activar` falso) o reactiva un vehículo. Nunca se elimina.
 * Si algo falla devuelve el mensaje para mostrar.
 */
export async function cambiarActivacion(id: string, activar: boolean) {
  const reactivar = activar === true;
  let vehiculo;
  try {
    vehiculo = await actualizarVehiculo(id, { estado: reactivar ? "activo" : "inactivo" });
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return "No pudimos cambiar el estado del vehículo. Intenta nuevamente.";
  }
  revalidatePath("/vehiculos");
  if (!vehiculo) redirect("/vehiculos");
  redirect(`/vehiculos?mensaje=${reactivar ? "reactivado" : "desactivado"}`);
}
