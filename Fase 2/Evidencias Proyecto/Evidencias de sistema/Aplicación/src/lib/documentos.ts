import { z } from "zod";
import { diasEntre, formatearFecha, leerFecha, sumarAnios, sumarDias } from "./fechas.ts";

// Reglas de los documentos: tipos, validación del formulario y cálculo del estado.

export const TIPOS_DOCUMENTO = [
  "revision_tecnica",
  "soap",
  "permiso_circulacion",
  "licencia_conducir",
  "otro",
] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];
export type TipoDueno = "vehiculo" | "conductor";

export const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  revision_tecnica: "Revisión técnica",
  soap: "SOAP",
  permiso_circulacion: "Permiso de circulación",
  licencia_conducir: "Licencia de conducir",
  otro: "Otro",
};

// Qué tipos de documento puede tener un vehículo y cuáles un conductor.
export const DUENOS_POR_TIPO: Record<TipoDocumento, readonly TipoDueno[]> = {
  revision_tecnica: ["vehiculo"],
  soap: ["vehiculo"],
  permiso_circulacion: ["vehiculo"],
  licencia_conducir: ["conductor"],
  otro: ["vehiculo", "conductor"],
};

export function tiposPara(dueno: TipoDueno) {
  return TIPOS_DOCUMENTO.filter((tipo) => DUENOS_POR_TIPO[tipo].includes(dueno));
}

// Cada vehículo o conductor tiene uno solo de cada tipo, salvo "otro".
export function esUnicoPorDueno(tipo: TipoDocumento) {
  return tipo !== "otro";
}

export type DuenoDocumento = {
  tipo: TipoDueno;
  id: string;
  // Patente o nombre del conductor
  nombre: string;
  activo: boolean;
};

export type Documento = {
  id: string;
  tipo: TipoDocumento;
  descripcion: string | null;
  // Formato AAAA-MM-DD
  fechaVencimiento: string;
  observaciones: string | null;
  dueno: DuenoDocumento;
};

// Nombre que se muestra, por ejemplo "SOAP" o la descripción si el tipo es "otro".
export function nombreDelDocumento({ tipo, descripcion }: Pick<Documento, "tipo" | "descripcion">) {
  if (tipo === "otro") return descripcion ?? ETIQUETA_TIPO_DOCUMENTO.otro;
  return descripcion ? `${ETIQUETA_TIPO_DOCUMENTO[tipo]} (${descripcion})` : ETIQUETA_TIPO_DOCUMENTO[tipo];
}

// Enlace a la ficha del vehículo o del conductor.
export function fichaDelDueno(dueno: Pick<DuenoDocumento, "tipo" | "id">) {
  return `/${dueno.tipo === "vehiculo" ? "vehiculos" : "conductores"}/${dueno.id}`;
}

// Para volver a la pantalla desde donde se abrió el formulario.
export type Origen = "listado" | "ficha";

export const ESTADOS_DOCUMENTO = ["vencido", "por_vencer", "vigente"] as const;
export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

export const ETIQUETA_ESTADO_DOCUMENTO: Record<EstadoDocumento, string> = {
  vencido: "Vencido",
  por_vencer: "Por vencer",
  vigente: "Vigente",
};

// Días antes del vencimiento en que un documento pasa a "por vencer".
export const DIAS_POR_VENCER = 30;

// Calcula si el documento está vigente, por vencer o vencido, y cuántos días le quedan.
// No se guarda en la base: se calcula siempre con la fecha de hoy.
export function calcularEstado(fechaVencimiento: string, hoy: string) {
  const dias = diasEntre(hoy, fechaVencimiento);
  const estado: EstadoDocumento =
    dias < 0 ? "vencido" : dias <= DIAS_POR_VENCER ? "por_vencer" : "vigente";
  return { estado, dias };
}

// Texto que acompaña al estado, por ejemplo "Vence en 5 días".
export function describirVencimiento(fechaVencimiento: string, hoy: string) {
  const { estado, dias } = calcularEstado(fechaVencimiento, hoy);
  if (estado === "vigente") return `Vence el ${formatearFecha(fechaVencimiento)}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  if (dias > 1) return `Vence en ${dias} días`;
  if (dias === -1) return "Venció ayer";
  return `Venció hace ${-dias} días`;
}

// Rango de fechas de cada estado, para filtrar el listado en la base de datos.
export function rangoDeEstado(estado: EstadoDocumento, hoy: string): { desde?: string; hasta?: string } {
  if (estado === "vencido") return { hasta: sumarDias(hoy, -1) };
  if (estado === "por_vencer") return { desde: hoy, hasta: sumarDias(hoy, DIAS_POR_VENCER) };
  return { desde: sumarDias(hoy, DIAS_POR_VENCER + 1) };
}

// Fechas de vencimiento permitidas: hasta 5 años atrás y 10 años hacia adelante.
export function rangoDeFechas(hoy: string) {
  return { minima: sumarAnios(hoy, -5), maxima: sumarAnios(hoy, 10) };
}

const MENSAJES = {
  tipo: "Selecciona el tipo de documento.",
  vehiculo: "Selecciona el vehículo al que pertenece el documento.",
  conductor: "Selecciona el conductor al que pertenece la licencia.",
  sinDueno: "Indica si el documento es de un vehículo o de un conductor.",
  noEsDeConductor: "Ese tipo de documento no corresponde a un conductor.",
  noEsDeVehiculo: "Ese tipo de documento no corresponde a un vehículo.",
  descripcion: "Describe el documento (entre 2 y 100 caracteres).",
  fecha: "Ingresa la fecha de vencimiento (DD-MM-AAAA).",
  observaciones: "Las observaciones pueden tener hasta 500 caracteres.",
};

// Un texto vacío se guarda como null.
const opcional = z
  .string()
  .trim()
  .nullish()
  .transform((valor) => valor || null);

const CAMPOS_DEL_DUENO = {
  tipo: z.enum(TIPOS_DOCUMENTO, { error: MENSAJES.tipo }),
  vehiculoId: opcional,
  conductorId: opcional,
  descripcion: z
    .string({ error: MENSAJES.descripcion })
    .trim()
    .nullish()
    .transform((valor) => valor || null)
    .pipe(z.string().min(2, MENSAJES.descripcion).max(100, MENSAJES.descripcion).nullable()),
};

type DatosDelDueno = z.infer<z.ZodObject<typeof CAMPOS_DEL_DUENO>>;

// Un solo dueño por documento, y descripción obligatoria si el tipo es "otro".
function reglasDelDueno(datos: DatosDelDueno, contexto: z.RefinementCtx) {
  const error = (campo: string, message: string) =>
    contexto.addIssue({ code: "custom", path: [campo], message });
  const duenos = DUENOS_POR_TIPO[datos.tipo];

  if (datos.vehiculoId && datos.conductorId) {
    error("dueno", MENSAJES.sinDueno);
  } else if (datos.conductorId && !duenos.includes("conductor")) {
    error("dueno", MENSAJES.noEsDeConductor);
  } else if (datos.vehiculoId && !duenos.includes("vehiculo")) {
    error("dueno", MENSAJES.noEsDeVehiculo);
  } else if (!datos.vehiculoId && !datos.conductorId) {
    if (datos.tipo === "otro") error("dueno", MENSAJES.sinDueno);
    else if (datos.tipo === "licencia_conducir") error("conductorId", MENSAJES.conductor);
    else error("vehiculoId", MENSAJES.vehiculo);
  }

  if (datos.tipo === "otro" && !datos.descripcion) error("descripcion", MENSAJES.descripcion);
}

const esquemaDelDueno = z.object(CAMPOS_DEL_DUENO).superRefine(reglasDelDueno);

export function esquemaDocumento(hoy: string) {
  const { minima, maxima } = rangoDeFechas(hoy);
  const fueraDeRango = `La fecha debe estar entre ${formatearFecha(minima)} y ${formatearFecha(maxima)}.`;

  return z
    .object({
      ...CAMPOS_DEL_DUENO,
      fechaVencimiento: z
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
      observaciones: z
        .string({ error: MENSAJES.observaciones })
        .trim()
        .max(500, MENSAJES.observaciones)
        .nullish()
        .transform((valor) => valor || null),
    })
    .superRefine(reglasDelDueno);
}

export type DatosDocumento = z.infer<ReturnType<typeof esquemaDocumento>>;
export type ErroresDocumento = Partial<Record<keyof DatosDocumento | "dueno" | "general", string>>;

// Valida el formulario y devuelve un mensaje de error por campo.
export function validarDocumento(
  datos: unknown,
  hoy: string,
): { ok: true; datos: DatosDocumento } | { ok: false; errores: ErroresDocumento } {
  const resultado = esquemaDocumento(hoy).safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresDocumento = {};
  const anotar = (problemas: z.core.$ZodIssue[]) => {
    for (const problema of problemas) {
      const campo = problema.path[0] as keyof ErroresDocumento;
      errores[campo] ??= problema.message;
    }
  };
  anotar(resultado.error.issues);

  // Se revisa el dueño aparte para mostrar todos los errores juntos.
  const dueno = esquemaDelDueno.safeParse(datos);
  if (!dueno.success) anotar(dueno.error.issues);
  return { ok: false, errores };
}

export function tipoDeDueno(datos: Pick<DatosDocumento, "vehiculoId">): TipoDueno {
  return datos.vehiculoId ? "vehiculo" : "conductor";
}

export function mensajeDuenoInactivo(dueno: TipoDueno) {
  const quien = dueno === "vehiculo" ? "un vehículo inactivo" : "un conductor inactivo";
  return `No puedes agregar documentos a ${quien}. Reactívalo primero.`;
}

// Para escribir "un SOAP registrado" o "una licencia registrada".
const FEMENINO: Record<TipoDocumento, boolean> = {
  revision_tecnica: true,
  soap: false,
  permiso_circulacion: false,
  licencia_conducir: true,
  otro: false,
};

// Mensaje cuando el vehículo o conductor ya tiene ese documento.
export function mensajeRepetido(tipo: TipoDocumento, dueno: TipoDueno, nombreDueno: string) {
  const femenino = FEMENINO[tipo];
  const etiqueta = tipo === "soap" ? "SOAP" : ETIQUETA_TIPO_DOCUMENTO[tipo].toLowerCase();
  const quien = dueno === "vehiculo" ? `El vehículo ${nombreDueno}` : nombreDueno;
  return femenino
    ? `${quien} ya tiene una ${etiqueta} registrada. Edítala para renovarla.`
    : `${quien} ya tiene un ${etiqueta} registrado. Edítalo para renovarlo.`;
}
