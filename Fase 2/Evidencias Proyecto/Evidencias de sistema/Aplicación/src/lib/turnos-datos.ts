import { Prisma } from "../generated/prisma/client.ts";
import { esFechaValida, fechaDesdeBase, fechaParaBase } from "./fechas.ts";
import {
  mensajeConductorInactivo,
  mensajeConductorOcupado,
  mensajeVehiculoNoActivo,
  mensajeVehiculoOcupado,
  sePuedeModificar,
  type DatosTurno,
  type ErroresTurno,
  type Jornada,
} from "./turnos.ts";
import type { Estado as EstadoVehiculo } from "./vehiculos.ts";

// Lectura y guardado de turnos (JOA-14). Todas las consultas filtran por la empresa.
// Reciben la base, la empresa y la fecha de hoy para poder probarlas con la base de datos;
// la app las llama con contextoDeTurnos() (turnos-sesion.ts), que toma la empresa de la sesión.

type BaseDeDatos = Pick<Prisma.TransactionClient, "turno" | "vehiculo" | "conductor">;

export type ContextoTurnos = { db: BaseDeDatos; empresaId: string; hoy: string };

export type Turno = {
  id: string;
  fecha: string;
  jornada: Jornada;
  anulado: boolean;
  motivoAnulacion: string | null;
  vehiculo: { id: string; patente: string; numeroInterno: string | null; estado: EstadoVehiculo };
  conductor: { id: string; nombre: string; activo: boolean };
};

const CAMPOS = {
  id: true,
  fecha: true,
  jornada: true,
  anulado: true,
  motivoAnulacion: true,
  vehiculo: { select: { id: true, patente: true, numeroInterno: true, estado: true } },
  conductor: { select: { id: true, nombre: true, activo: true } },
} satisfies Prisma.TurnoSelect;

type Fila = Prisma.TurnoGetPayload<{ select: typeof CAMPOS }>;

function aTurno({ fecha, ...turno }: Fila): Turno {
  return { ...turno, fecha: fechaDesdeBase(fecha) };
}

// Por fecha, jornada (mañana, tarde y noche) y patente.
export const ORDEN_TURNOS = [
  { fecha: "asc" },
  { jornada: "asc" },
  { vehiculo: { patente: "asc" } },
  { createdAt: "asc" },
] satisfies Prisma.TurnoOrderByWithRelationInput[];

// Un id que no tiene formato UUID se trata como no encontrado.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

// El vehículo o el conductor elegido no existe en la empresa: la página responde 404.
export class NoEncontradoError extends Error {}

// El turno no se puede guardar. Trae un mensaje por campo para mostrarlo junto a cada uno.
export class TurnoNoValidoError extends Error {
  readonly errores: ErroresTurno;

  constructor(errores: ErroresTurno) {
    super("Turno no válido");
    this.errores = errores;
  }
}

// Turno pasado o anulado: ya no se edita ni se anula.
export class TurnoNoModificableError extends Error {}

// Turnos de un día, incluidos los anulados, que se muestran tachados.
export async function turnosDelDia({ db, empresaId }: ContextoTurnos, fecha: string): Promise<Turno[]> {
  if (!esFechaValida(fecha)) return [];
  const filas = await db.turno.findMany({
    where: { empresaId, fecha: fechaParaBase(fecha) },
    select: CAMPOS,
    orderBy: ORDEN_TURNOS,
  });
  return filas.map(aTurno);
}

export type FiltroTurnos = {
  vehiculoId?: string;
  conductorId?: string;
  incluirAnulados?: boolean;
};

// Turnos desde hoy, de un vehículo o de un conductor. "Ocultar anulados" viene marcado por defecto.
export async function turnosDesdeHoy(
  { db, empresaId, hoy }: ContextoTurnos,
  { vehiculoId, conductorId, incluirAnulados = false }: FiltroTurnos,
): Promise<Turno[]> {
  if ([vehiculoId, conductorId].some((id) => id !== undefined && !UUID.test(id))) return [];
  const filas = await db.turno.findMany({
    where: {
      empresaId,
      vehiculoId,
      conductorId,
      fecha: { gte: fechaParaBase(hoy) },
      anulado: incluirAnulados ? undefined : false,
    },
    select: CAMPOS,
    orderBy: ORDEN_TURNOS,
  });
  return filas.map(aTurno);
}

export async function obtenerTurno({ db, empresaId }: ContextoTurnos, id: string): Promise<Turno | null> {
  if (!UUID.test(id)) return null;
  const fila = await db.turno.findFirst({ where: { id, empresaId }, select: CAMPOS });
  return fila && aTurno(fila);
}

// Turnos desde hoy que no están anulados. Se muestran al confirmar la desactivación de un
// vehículo o conductor, porque sus turnos no se anulan solos (JOA-14, criterio 11).
export async function contarTurnosDesdeHoy(
  { db, empresaId, hoy }: ContextoTurnos,
  dueno: { vehiculoId: string } | { conductorId: string },
): Promise<number> {
  if (!Object.values(dueno).every((id) => UUID.test(id))) return 0;
  return db.turno.count({
    where: { ...dueno, empresaId, anulado: false, fecha: { gte: fechaParaBase(hoy) } },
  });
}

type TurnoActual = { id: string; vehiculoId: string; conductorId: string };

// Revisa que el vehículo y el conductor sean de la empresa, estén activos y no tengan otro
// turno en esa fecha y jornada. Al editar, se pueden mantener los del turno aunque ya no
// estén activos: la regla de "solo activos" es para elegir uno nuevo (JOA-14, sección 3.1).
async function revisarAsignacion(
  { db, empresaId }: ContextoTurnos,
  datos: DatosTurno,
  actual?: TurnoActual,
) {
  if (!UUID.test(datos.vehiculoId) || !UUID.test(datos.conductorId)) throw new NoEncontradoError();
  const vehiculo = await db.vehiculo.findFirst({
    where: { id: datos.vehiculoId, empresaId },
    select: { patente: true, estado: true },
  });
  const conductor = await db.conductor.findFirst({
    where: { id: datos.conductorId, empresaId },
    select: { nombre: true, activo: true },
  });
  if (!vehiculo || !conductor) throw new NoEncontradoError();

  const errores: ErroresTurno = {};
  if (vehiculo.estado !== "activo" && datos.vehiculoId !== actual?.vehiculoId) {
    errores.vehiculoId = mensajeVehiculoNoActivo(vehiculo.patente);
  }
  if (!conductor.activo && datos.conductorId !== actual?.conductorId) {
    errores.conductorId = mensajeConductorInactivo(conductor.nombre);
  }

  // Los anulados no cuentan: anular libera el vehículo y el conductor.
  const ocupados = await db.turno.findMany({
    where: {
      empresaId,
      fecha: fechaParaBase(datos.fecha),
      jornada: datos.jornada,
      anulado: false,
      id: actual ? { not: actual.id } : undefined,
      OR: [{ vehiculoId: datos.vehiculoId }, { conductorId: datos.conductorId }],
    },
    select: { vehiculoId: true, conductorId: true },
  });
  if (!errores.vehiculoId && ocupados.some((turno) => turno.vehiculoId === datos.vehiculoId)) {
    errores.vehiculoId = mensajeVehiculoOcupado(vehiculo.patente, datos.fecha, datos.jornada);
  }
  if (!errores.conductorId && ocupados.some((turno) => turno.conductorId === datos.conductorId)) {
    errores.conductorId = mensajeConductorOcupado(conductor.nombre, datos.fecha, datos.jornada);
  }

  if (Object.keys(errores).length > 0) throw new TurnoNoValidoError(errores);
}

function datosParaBase(datos: DatosTurno) {
  return {
    fecha: fechaParaBase(datos.fecha),
    jornada: datos.jornada,
    vehiculoId: datos.vehiculoId,
    conductorId: datos.conductorId,
  };
}

// Asigna un turno con datos ya validados con validarTurno() y devuelve el turno guardado.
export async function crearTurno(contexto: ContextoTurnos, datos: DatosTurno): Promise<Turno> {
  await revisarAsignacion(contexto, datos);
  try {
    const fila = await contexto.db.turno.create({
      data: { ...datosParaBase(datos), empresaId: contexto.empresaId },
      select: CAMPOS,
    });
    return aTurno(fila);
  } catch (error) {
    // Alguien asignó el mismo vehículo o conductor al mismo tiempo: se muestra el mensaje del campo.
    if (codigoPrisma(error) === "P2002") await revisarAsignacion(contexto, datos);
    throw error;
  }
}

// Busca el turno en la empresa y revisa que se pueda modificar. Devuelve null si no existe.
async function turnoModificable({ db, empresaId, hoy }: ContextoTurnos, id: string) {
  if (!UUID.test(id)) return null;
  const actual = await db.turno.findFirst({
    where: { id, empresaId },
    select: { id: true, fecha: true, anulado: true, vehiculoId: true, conductorId: true },
  });
  if (!actual) return null;
  if (!sePuedeModificar({ fecha: fechaDesdeBase(actual.fecha), anulado: actual.anulado }, hoy)) {
    throw new TurnoNoModificableError();
  }
  return actual;
}

// Cambia la fecha, la jornada, el vehículo o el conductor. Devuelve null si el turno no existe en la empresa.
export async function actualizarTurno(
  contexto: ContextoTurnos,
  id: string,
  datos: DatosTurno,
): Promise<Turno | null> {
  const actual = await turnoModificable(contexto, id);
  if (!actual) return null;
  await revisarAsignacion(contexto, datos, actual);
  try {
    const fila = await contexto.db.turno.update({
      where: { id, empresaId: contexto.empresaId },
      data: datosParaBase(datos),
      select: CAMPOS,
    });
    return aTurno(fila);
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    if (codigoPrisma(error) === "P2002") await revisarAsignacion(contexto, datos, actual);
    throw error;
  }
}

// Marca el turno como anulado, con el motivo si se escribió. No se borra.
// Devuelve null si el turno no existe en la empresa.
export async function anularTurno(
  contexto: ContextoTurnos,
  id: string,
  motivo: string | null,
): Promise<Turno | null> {
  const actual = await turnoModificable(contexto, id);
  if (!actual) return null;
  try {
    const fila = await contexto.db.turno.update({
      where: { id, empresaId: contexto.empresaId },
      data: { anulado: true, motivoAnulacion: motivo },
      select: CAMPOS,
    });
    return aTurno(fila);
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    throw error;
  }
}

export type OpcionesTurno = {
  vehiculos: { id: string; patente: string; numeroInterno: string | null; activo: boolean; ocupado: boolean }[];
  conductores: { id: string; nombre: string; activo: boolean; ocupado: boolean }[];
};

// Vehículos y conductores para el formulario: los activos, y si ya tienen turno en esa fecha y
// jornada (JOA-14, sección 4). Al editar, se agregan los del turno aunque ya no estén activos.
export async function opcionesDeTurno(
  { db, empresaId }: ContextoTurnos,
  { fecha, jornada, turnoId }: { fecha?: string; jornada?: Jornada; turnoId?: string } = {},
): Promise<OpcionesTurno> {
  const actual =
    turnoId && UUID.test(turnoId)
      ? await db.turno.findFirst({
          where: { id: turnoId, empresaId },
          select: { id: true, vehiculoId: true, conductorId: true },
        })
      : null;

  const vehiculos = await db.vehiculo.findMany({
    where: { empresaId, OR: [{ estado: "activo" }, ...(actual ? [{ id: actual.vehiculoId }] : [])] },
    select: { id: true, patente: true, numeroInterno: true, estado: true },
    orderBy: { patente: "asc" },
  });
  const conductores = await db.conductor.findMany({
    where: { empresaId, OR: [{ activo: true }, ...(actual ? [{ id: actual.conductorId }] : [])] },
    select: { id: true, nombre: true, activo: true },
    orderBy: [{ nombre: "asc" }, { rut: "asc" }],
  });

  const ocupados =
    fecha && jornada && esFechaValida(fecha)
      ? await db.turno.findMany({
          where: {
            empresaId,
            fecha: fechaParaBase(fecha),
            jornada,
            anulado: false,
            id: actual ? { not: actual.id } : undefined,
          },
          select: { vehiculoId: true, conductorId: true },
        })
      : [];
  const vehiculosOcupados = new Set(ocupados.map((turno) => turno.vehiculoId));
  const conductoresOcupados = new Set(ocupados.map((turno) => turno.conductorId));

  return {
    vehiculos: vehiculos.map(({ estado, ...vehiculo }) => ({
      ...vehiculo,
      activo: estado === "activo",
      ocupado: vehiculosOcupados.has(vehiculo.id),
    })),
    conductores: conductores.map((conductor) => ({
      ...conductor,
      ocupado: conductoresOcupados.has(conductor.id),
    })),
  };
}
