import { Prisma } from "@/generated/prisma/client";
import {
  esUnicoPorDueno,
  tipoDeDueno,
  type DatosDocumento,
  type Documento,
  type DuenoDocumento,
  type TipoDocumento,
  type TipoDueno,
} from "@/lib/documentos";
import {
  documentoDeLaEmpresa,
  documentosDelDueno,
  filtroDocumentos,
  ORDEN_DOCUMENTOS,
  type FiltroDocumentos,
} from "@/lib/documentos-filtros";
import { fechaDesdeBase, fechaParaBase, hoyEnChile } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";
import { empresaDeLaSesion } from "@/lib/sesion";
import { formatearPatente } from "@/lib/vehiculos";

// Acceso a datos de documentos (JOA-10). Igual que en vehículos y conductores, toda consulta
// filtra por la empresa de la sesión, también al buscar por id: un documento, vehículo o
// conductor de otra empresa se trata igual que uno que no existe.
//
// Lo que Zod no puede comprobar se comprueba aquí: que el dueño sea de la empresa y esté
// activo, y que no tenga ya un documento del mismo tipo. La base de datos tiene las mismas
// reglas (claves foráneas compuestas, CHECK e índices únicos parciales) por si algo se escapa.

const CAMPOS = {
  id: true,
  tipo: true,
  descripcion: true,
  fechaVencimiento: true,
  observaciones: true,
  vehiculo: { select: { id: true, patente: true, estado: true } },
  conductor: { select: { id: true, nombre: true, activo: true } },
} satisfies Prisma.DocumentoSelect;

type Fila = Prisma.DocumentoGetPayload<{ select: typeof CAMPOS }>;

// Un id con otro formato no existe; además, Postgres rechazaría la consulta.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

/** El vehículo o conductor elegido no existe en la empresa de la sesión. */
export class DuenoNoEncontradoError extends Error {}

/** No se agregan documentos a un vehículo o conductor inactivo (JOA-10, sección 2). */
export class DuenoInactivoError extends Error {
  constructor(readonly dueno: TipoDueno) {
    super("Dueño inactivo");
  }
}

/** El dueño ya tiene un documento de ese tipo: se edita para renovarlo (JOA-10, sección 3.3). */
export class DocumentoRepetidoError extends Error {
  constructor(
    readonly tipo: TipoDocumento,
    readonly dueno: DuenoDocumento,
    /** El documento que ya existe, para llevar al usuario a editarlo. */
    readonly existenteId: string,
  ) {
    super("Documento repetido");
  }
}

/** Al editar, el dueño cambia solo dentro del mismo tipo: de vehículo a vehículo o de conductor a conductor. */
export class CambioDeDuenoError extends Error {
  constructor(readonly actual: TipoDueno) {
    super("Cambio de tipo de dueño");
  }
}

function aDocumento({ vehiculo, conductor, fechaVencimiento, ...documento }: Fila): Documento {
  let dueno: DuenoDocumento;
  if (vehiculo) {
    dueno = {
      tipo: "vehiculo",
      id: vehiculo.id,
      nombre: formatearPatente(vehiculo.patente),
      activo: vehiculo.estado !== "inactivo",
    };
  } else if (conductor) {
    dueno = { tipo: "conductor", id: conductor.id, nombre: conductor.nombre, activo: conductor.activo };
  } else {
    // La regla CHECK documento_un_dueno_check lo impide.
    throw new Error(`El documento ${documento.id} no tiene dueño.`);
  }
  return { ...documento, fechaVencimiento: fechaDesdeBase(fechaVencimiento), dueno };
}

/** Ordenados por vencimiento, del más vencido al más lejano (JOA-10, sección 4). */
export async function listarDocumentos(filtro: FiltroDocumentos = {}): Promise<Documento[]> {
  const empresaId = await empresaDeLaSesion();
  const filas = await prisma.documento.findMany({
    where: filtroDocumentos(empresaId, hoyEnChile(), filtro),
    select: CAMPOS,
    orderBy: ORDEN_DOCUMENTOS,
  });
  return filas.map(aDocumento);
}

/** Si la empresa tiene algún documento, de cualquier dueño. Para el mensaje del listado vacío. */
export async function hayDocumentos(): Promise<boolean> {
  const empresaId = await empresaDeLaSesion();
  return (await prisma.documento.findFirst({ where: { empresaId }, select: { id: true } })) !== null;
}

/** Los documentos de un vehículo o conductor, para su ficha. */
export async function documentosDe(dueno: Pick<DuenoDocumento, "tipo" | "id">): Promise<Documento[]> {
  if (!UUID.test(dueno.id)) return [];
  const empresaId = await empresaDeLaSesion();
  const filas = await prisma.documento.findMany({
    where: documentosDelDueno(empresaId, dueno),
    select: CAMPOS,
    orderBy: ORDEN_DOCUMENTOS,
  });
  return filas.map(aDocumento);
}

export async function obtenerDocumento(id: string): Promise<Documento | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  const fila = await prisma.documento.findFirst({
    where: documentoDeLaEmpresa(id, empresaId),
    select: CAMPOS,
  });
  return fila && aDocumento(fila);
}

/** El dueño elegido en el formulario, solo si es de la empresa. */
async function buscarDueno(empresaId: string, datos: DatosDocumento): Promise<DuenoDocumento | null> {
  if (datos.vehiculoId) {
    if (!UUID.test(datos.vehiculoId)) return null;
    const vehiculo = await prisma.vehiculo.findFirst({
      where: { id: datos.vehiculoId, empresaId },
      select: { id: true, patente: true, estado: true },
    });
    return (
      vehiculo && {
        tipo: "vehiculo",
        id: vehiculo.id,
        nombre: formatearPatente(vehiculo.patente),
        activo: vehiculo.estado !== "inactivo",
      }
    );
  }
  if (!datos.conductorId || !UUID.test(datos.conductorId)) return null;
  const conductor = await prisma.conductor.findFirst({
    where: { id: datos.conductorId, empresaId },
    select: { id: true, nombre: true, activo: true },
  });
  return conductor && { tipo: "conductor", ...conductor };
}

/** El documento del mismo tipo que ya tiene el dueño, sin contar `excluirId` (el que se edita). */
async function buscarRepetido(
  empresaId: string,
  tipo: TipoDocumento,
  dueno: DuenoDocumento,
  excluirId: string | null,
): Promise<DocumentoRepetidoError | null> {
  if (!esUnicoPorDueno(tipo)) return null;
  const existente = await prisma.documento.findFirst({
    where: {
      ...documentosDelDueno(empresaId, dueno),
      tipo,
      id: excluirId ? { not: excluirId } : undefined,
    },
    select: { id: true },
  });
  return existente ? new DocumentoRepetidoError(tipo, dueno, existente.id) : null;
}

function datosParaBase(datos: DatosDocumento) {
  return {
    tipo: datos.tipo,
    descripcion: datos.descripcion,
    vehiculoId: datos.vehiculoId,
    conductorId: datos.conductorId,
    fechaVencimiento: fechaParaBase(datos.fechaVencimiento),
    observaciones: datos.observaciones,
  };
}

/**
 * Registra un documento ya validado con `validarDocumento`. Lanza `DuenoNoEncontradoError`,
 * `DuenoInactivoError` o `DocumentoRepetidoError`. Devuelve su dueño, para volver a su ficha.
 */
export async function crearDocumento(datos: DatosDocumento): Promise<DuenoDocumento> {
  const empresaId = await empresaDeLaSesion();
  const dueno = await buscarDueno(empresaId, datos);
  if (!dueno) throw new DuenoNoEncontradoError();
  if (!dueno.activo) throw new DuenoInactivoError(dueno.tipo);

  const repetido = await buscarRepetido(empresaId, datos.tipo, dueno, null);
  if (repetido) throw repetido;

  try {
    await prisma.documento.create({ data: { ...datosParaBase(datos), empresaId }, select: { id: true } });
  } catch (error) {
    // Otro registro del mismo documento justo entre la comprobación y el guardado.
    if (codigoPrisma(error) === "P2002") {
      throw (await buscarRepetido(empresaId, datos.tipo, dueno, null)) ?? error;
    }
    throw error;
  }
  return dueno;
}

/**
 * Renueva (nueva fecha) o corrige un documento (JOA-10, sección 3.3). Devuelve `null` si no
 * existe en la empresa de la sesión, o su dueño, para volver a su ficha. Lanza
 * `CambioDeDuenoError` si pasa de un vehículo a un conductor o al revés, y los mismos errores
 * de `crearDocumento`. Un documento de un dueño inactivo se puede renovar, pero no pasar a otro
 * dueño inactivo.
 */
export async function actualizarDocumento(id: string, datos: DatosDocumento): Promise<DuenoDocumento | null> {
  if (!UUID.test(id)) return null;
  const empresaId = await empresaDeLaSesion();
  const actual = await prisma.documento.findFirst({
    where: documentoDeLaEmpresa(id, empresaId),
    select: { vehiculoId: true, conductorId: true },
  });
  if (!actual) return null;

  const tipoActual: TipoDueno = actual.vehiculoId ? "vehiculo" : "conductor";
  if (tipoDeDueno(datos) !== tipoActual) throw new CambioDeDuenoError(tipoActual);

  const dueno = await buscarDueno(empresaId, datos);
  if (!dueno) throw new DuenoNoEncontradoError();
  const mismoDueno = dueno.id === (actual.vehiculoId ?? actual.conductorId);
  if (!dueno.activo && !mismoDueno) throw new DuenoInactivoError(dueno.tipo);

  const repetido = await buscarRepetido(empresaId, datos.tipo, dueno, id);
  if (repetido) throw repetido;

  try {
    await prisma.documento.update({
      where: documentoDeLaEmpresa(id, empresaId),
      data: datosParaBase(datos),
      select: { id: true },
    });
  } catch (error) {
    if (codigoPrisma(error) === "P2025") return null;
    if (codigoPrisma(error) === "P2002") {
      throw (await buscarRepetido(empresaId, datos.tipo, dueno, id)) ?? error;
    }
    throw error;
  }
  return dueno;
}
