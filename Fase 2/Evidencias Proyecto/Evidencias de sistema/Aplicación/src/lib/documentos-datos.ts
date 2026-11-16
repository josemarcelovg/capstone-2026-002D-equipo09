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

// Lectura y guardado de documentos. Todas las consultas filtran por la empresa de la sesión.

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

// Un id que no tiene formato UUID se trata como no encontrado.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const codigoPrisma = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ? error.code : null;

export class DuenoNoEncontradoError extends Error {}

export class DuenoInactivoError extends Error {
  constructor(readonly dueno: TipoDueno) {
    super("Dueño inactivo");
  }
}

// El dueño ya tiene un documento de ese tipo: hay que editarlo para renovarlo.
export class DocumentoRepetidoError extends Error {
  constructor(
    readonly tipo: TipoDocumento,
    readonly dueno: DuenoDocumento,
    readonly existenteId: string,
  ) {
    super("Documento repetido");
  }
}

// Al editar, un documento no puede pasar de un vehículo a un conductor ni al revés.
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
    // No debería pasar: la base exige un dueño.
    throw new Error(`El documento ${documento.id} no tiene dueño.`);
  }
  return { ...documento, fechaVencimiento: fechaDesdeBase(fechaVencimiento), dueno };
}

// Ordenados del más vencido al que vence más tarde.
export async function listarDocumentos(filtro: FiltroDocumentos = {}): Promise<Documento[]> {
  const empresaId = await empresaDeLaSesion();
  const filas = await prisma.documento.findMany({
    where: filtroDocumentos(empresaId, hoyEnChile(), filtro),
    select: CAMPOS,
    orderBy: ORDEN_DOCUMENTOS,
  });
  return filas.map(aDocumento);
}

// Para saber qué mensaje mostrar cuando el listado está vacío.
export async function hayDocumentos(): Promise<boolean> {
  const empresaId = await empresaDeLaSesion();
  return (await prisma.documento.findFirst({ where: { empresaId }, select: { id: true } })) !== null;
}

// Documentos de un vehículo o conductor, para mostrarlos en su ficha.
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

// Busca el vehículo o conductor elegido, solo dentro de la empresa.
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

// Busca si el dueño ya tiene un documento de ese tipo, sin contar el que se está editando.
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

// Guarda un documento nuevo y devuelve su dueño, para volver a su ficha.
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
    // Alguien guardó el mismo documento al mismo tiempo.
    if (codigoPrisma(error) === "P2002") {
      throw (await buscarRepetido(empresaId, datos.tipo, dueno, null)) ?? error;
    }
    throw error;
  }
  return dueno;
}

// Renueva o corrige un documento. Devuelve null si no existe en la empresa.
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
