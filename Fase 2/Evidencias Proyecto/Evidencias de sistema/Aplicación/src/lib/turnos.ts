import { z } from "zod";
import { formatearFecha, leerFecha, sumarDias } from "./fechas.ts";
import { formatearPatente, type Estado as EstadoVehiculo } from "./vehiculos.ts";

// Reglas de los turnos (JOA-14): jornadas, validación del formulario y mensajes.
// No consulta la base de datos: que el vehículo y el conductor estén activos y libres lo
// revisa el acceso a datos (JOS-20), con los mensajes de este archivo.

export const JORNADAS = ["manana", "tarde", "noche"] as const;
export type Jornada = (typeof JORNADAS)[number];

export const ETIQUETA_JORNADA: Record<Jornada, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

// Un turno se puede asignar desde hoy hasta 60 días hacia adelante, en hora de Chile.
export const DIAS_PARA_PLANIFICAR = 60;

export function rangoDeFechasTurno(hoy: string) {
  return { minima: hoy, maxima: sumarDias(hoy, DIAS_PARA_PLANIFICAR) };
}

const MENSAJES = {
  fecha: "Selecciona la fecha del turno.",
  jornada: "Selecciona la jornada.",
  vehiculo: "Selecciona el vehículo.",
  conductor: "Selecciona el conductor.",
  motivo: "El motivo puede tener hasta 200 caracteres.",
};

// Mensajes de las pantallas de turnos (JOA-14, sección 4).
export const MENSAJES_TURNO = {
  asignado: "Turno asignado correctamente.",
  editado: "Los cambios del turno se guardaron.",
  anulado: "Turno anulado.",
  noModificable: "Este turno ya no se puede modificar.",
  errorServidor: "No pudimos guardar el turno. Intenta nuevamente.",
  sinTurnos: "No hay turnos para este día",
};

const obligatorio = (mensaje: string) => z.string({ error: mensaje }).trim().min(1, mensaje);

export function esquemaTurno(hoy: string) {
  const { minima, maxima } = rangoDeFechasTurno(hoy);
  const fueraDeRango = `La fecha debe estar entre hoy y el ${formatearFecha(maxima)}.`;

  return z.object({
    fecha: z
      .string({ error: MENSAJES.fecha })
      .transform((valor, contexto) => {
        const fecha = leerFecha(valor);
        if (!fecha) {
          contexto.addIssue({ code: "custom", message: MENSAJES.fecha });
          return z.NEVER;
        }
        return fecha;
      })
      .refine((fecha) => fecha >= minima && fecha <= maxima, fueraDeRango),
    jornada: z.enum(JORNADAS, { error: MENSAJES.jornada }),
    vehiculoId: obligatorio(MENSAJES.vehiculo),
    conductorId: obligatorio(MENSAJES.conductor),
  });
}

export type DatosTurno = z.infer<ReturnType<typeof esquemaTurno>>;
export type ErroresTurno = Partial<Record<keyof DatosTurno | "general", string>>;

// Valida el formulario de crear y de editar, y devuelve un mensaje de error por campo.
// Los campos que no son del turno, como empresa_id, se descartan: la empresa sale de la sesión.
export function validarTurno(
  datos: unknown,
  hoy: string,
): { ok: true; datos: DatosTurno } | { ok: false; errores: ErroresTurno } {
  const resultado = esquemaTurno(hoy).safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresTurno = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof DatosTurno;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

export const esquemaAnulacion = z.object({
  motivo: z
    .string({ error: MENSAJES.motivo })
    .trim()
    .max(200, MENSAJES.motivo)
    .nullish()
    .transform((valor) => valor || null),
});

export function validarAnulacion(
  datos: unknown,
): { ok: true; motivo: string | null } | { ok: false; error: string } {
  const resultado = esquemaAnulacion.safeParse(datos);
  return resultado.success
    ? { ok: true, motivo: resultado.data.motivo }
    : { ok: false, error: resultado.error.issues[0].message };
}

// Solo se editan o anulan los turnos de hoy en adelante que no estén anulados.
export function sePuedeModificar(turno: { fecha: string; anulado: boolean }, hoy: string) {
  return !turno.anulado && turno.fecha >= hoy;
}

// Para escribir "en la mañana" o "el turno de la tarde".
function jornadaEnTexto(jornada: Jornada) {
  return ETIQUETA_JORNADA[jornada].toLowerCase();
}

// Mensajes que usa el acceso a datos cuando la base no permite el turno (JOA-14, sección 4).
export function mensajeVehiculoNoActivo(patente: string) {
  return `El vehículo ${formatearPatente(patente)} no está activo y no se puede asignar.`;
}

export function mensajeConductorInactivo(nombre: string) {
  return `${nombre} está inactivo y no se puede asignar.`;
}

export function mensajeVehiculoOcupado(patente: string, fecha: string, jornada: Jornada) {
  return `${formatearPatente(patente)} ya tiene un turno el ${formatearFecha(fecha)} en la ${jornadaEnTexto(jornada)}.`;
}

export function mensajeConductorOcupado(nombre: string, fecha: string, jornada: Jornada) {
  return `${nombre} ya tiene un turno el ${formatearFecha(fecha)} en la ${jornadaEnTexto(jornada)}.`;
}

// Confirmación antes de anular (JOA-14, sección 3.2).
export function preguntaAnular(turno: { fecha: string; jornada: Jornada; patente: string; conductor: string }) {
  return `¿Anular el turno de la ${jornadaEnTexto(turno.jornada)} del ${formatearFecha(turno.fecha)} (${formatearPatente(turno.patente)} · ${turno.conductor})?`;
}

// Avisos que se muestran en cada turno, para leerlos en el texto y no solo por el color.
export function avisosDelTurno(turno: {
  anulado: boolean;
  estadoVehiculo: EstadoVehiculo;
  conductorActivo: boolean;
}) {
  const avisos: string[] = [];
  if (turno.anulado) avisos.push("Anulado");
  if (turno.estadoVehiculo === "en_mantencion") avisos.push("Vehículo en mantención");
  if (turno.estadoVehiculo === "inactivo") avisos.push("Vehículo inactivo");
  if (!turno.conductorActivo) avisos.push("Conductor inactivo");
  return avisos;
}

// Texto para la confirmación al desactivar un vehículo o conductor con turnos desde hoy
// (JOA-14, criterio 11). Los turnos no se anulan solos.
export function textoTurnosFuturos(cantidad: number) {
  if (cantidad === 0) return null;
  return cantidad === 1
    ? "Tiene 1 turno desde hoy. No se anula: quedará con un aviso para reasignarlo."
    : `Tiene ${cantidad} turnos desde hoy. No se anulan: quedarán con un aviso para reasignarlos.`;
}
