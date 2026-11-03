import { z } from "zod";
import { diasEntre, formatearFecha, leerFecha, sumarAnios, sumarDias } from "./fechas.ts";

// Tipos, dueño, campos, mensajes y estado de los documentos según JOA-10 (secciones 2 a 4).
// El formulario y el servidor validan con este mismo esquema. Lo que necesita la base de datos
// (dueño de la empresa y activo, documento repetido) se comprueba en el acceso a datos.
// Importa fechas.ts con ruta relativa para que las pruebas lo carguen sin Next.js.

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

/** A quién puede pertenecer cada tipo (JOA-10, sección 3.1). */
export const DUENOS_POR_TIPO: Record<TipoDocumento, readonly TipoDueno[]> = {
  revision_tecnica: ["vehiculo"],
  soap: ["vehiculo"],
  permiso_circulacion: ["vehiculo"],
  licencia_conducir: ["conductor"],
  otro: ["vehiculo", "conductor"],
};

/** Tipos que se pueden registrar para un vehículo o para un conductor. */
export function tiposPara(dueno: TipoDueno) {
  return TIPOS_DOCUMENTO.filter((tipo) => DUENOS_POR_TIPO[tipo].includes(dueno));
}

/** Un dueño tiene uno solo de cada tipo, salvo "otro": renovar es editar (JOA-10, sección 2). */
export function esUnicoPorDueno(tipo: TipoDocumento) {
  return tipo !== "otro";
}

// --- Estado -------------------------------------------------------------------------------

export const ESTADOS_DOCUMENTO = ["vencido", "por_vencer", "vigente"] as const;
export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

export const ETIQUETA_ESTADO_DOCUMENTO: Record<EstadoDocumento, string> = {
  vencido: "Vencido",
  por_vencer: "Por vencer",
  vigente: "Vigente",
};

/** "Por vencer" es 30 días o menos, contando el día del vencimiento. Un solo valor para todo. */
export const DIAS_POR_VENCER = 30;

/**
 * Estado de un documento y días que faltan para su vencimiento (negativo si ya venció).
 * El estado no se guarda: se calcula con la fecha de hoy en Chile (`hoyEnChile()`). La fecha de
 * vencimiento es el último día válido, así que ese día el documento todavía está "por vencer".
 * La reutilizan las pantallas y el proceso de avisos (JOA-10, sección 3.4).
 */
export function calcularEstado(fechaVencimiento: string, hoy: string) {
  const dias = diasEntre(hoy, fechaVencimiento);
  const estado: EstadoDocumento =
    dias < 0 ? "vencido" : dias <= DIAS_POR_VENCER ? "por_vencer" : "vigente";
  return { estado, dias };
}

/** El texto que acompaña al estado (JOA-10, sección 3.2). No depende solo del color. */
export function describirVencimiento(fechaVencimiento: string, hoy: string) {
  const { estado, dias } = calcularEstado(fechaVencimiento, hoy);
  if (estado === "vigente") return `Vence el ${formatearFecha(fechaVencimiento)}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  if (dias > 1) return `Vence en ${dias} días`;
  if (dias === -1) return "Venció ayer";
  return `Venció hace ${-dias} días`;
}

/**
 * Las fechas de vencimiento que corresponden a un estado, para filtrar en la base de datos sin
 * repetir la regla de los 30 días. Las fechas son `AAAA-MM-DD`, así que se comparan como texto.
 */
export function rangoDeEstado(estado: EstadoDocumento, hoy: string): { desde?: string; hasta?: string } {
  if (estado === "vencido") return { hasta: sumarDias(hoy, -1) };
  if (estado === "por_vencer") return { desde: hoy, hasta: sumarDias(hoy, DIAS_POR_VENCER) };
  return { desde: sumarDias(hoy, DIAS_POR_VENCER + 1) };
}

// --- Validación ---------------------------------------------------------------------------

/** Fechas permitidas: de hoy menos 5 años a hoy más 10 años (JOA-10, sección 2). */
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

/** Texto vacío o con solo espacios → `null`. */
const opcional = z
  .string()
  .trim()
  .nullish()
  .transform((valor) => valor || null);

export function esquemaDocumento(hoy: string) {
  const { minima, maxima } = rangoDeFechas(hoy);
  const fueraDeRango = `La fecha debe estar entre ${formatearFecha(minima)} y ${formatearFecha(maxima)}.`;

  return z
    .object({
      tipo: z.enum(TIPOS_DOCUMENTO, { error: MENSAJES.tipo }),
      vehiculoId: opcional,
      conductorId: opcional,
      descripcion: z
        .string({ error: MENSAJES.descripcion })
        .trim()
        .nullish()
        .transform((valor) => valor || null)
        .pipe(z.string().min(2, MENSAJES.descripcion).max(100, MENSAJES.descripcion).nullable()),
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
    .superRefine((datos, contexto) => {
      const error = (campo: string, message: string) =>
        contexto.addIssue({ code: "custom", path: [campo], message });
      const duenos = DUENOS_POR_TIPO[datos.tipo];

      // Siempre hay exactamente un dueño, y tiene que ser uno que admite el tipo.
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
    });
}

export type DatosDocumento = z.infer<ReturnType<typeof esquemaDocumento>>;
export type ErroresDocumento = Partial<Record<keyof DatosDocumento | "dueno" | "general", string>>;

/** Valida los datos de un formulario y devuelve un error por campo. `hoy` es `hoyEnChile()`. */
export function validarDocumento(
  datos: unknown,
  hoy: string,
): { ok: true; datos: DatosDocumento } | { ok: false; errores: ErroresDocumento } {
  const resultado = esquemaDocumento(hoy).safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresDocumento = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof ErroresDocumento;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

/** El dueño de un documento ya validado. */
export function tipoDeDueno(datos: Pick<DatosDocumento, "vehiculoId">): TipoDueno {
  return datos.vehiculoId ? "vehiculo" : "conductor";
}

// --- Mensajes que necesitan datos de la base ----------------------------------------------

/** "No puedes agregar documentos a un vehículo inactivo. Reactívalo primero." */
export function mensajeDuenoInactivo(dueno: TipoDueno) {
  const quien = dueno === "vehiculo" ? "un vehículo inactivo" : "un conductor inactivo";
  return `No puedes agregar documentos a ${quien}. Reactívalo primero.`;
}

// Género de cada tipo, para "un SOAP registrado. Edítalo" o "una licencia… registrada. Edítala".
const FEMENINO: Record<TipoDocumento, boolean> = {
  revision_tecnica: true,
  soap: false,
  permiso_circulacion: false,
  licencia_conducir: true,
  otro: false,
};

/**
 * "El vehículo BBCD-12 ya tiene un SOAP registrado. Edítalo para renovarlo." o
 * "Pedro Soto ya tiene una licencia de conducir registrada. Edítala para renovarla."
 * `nombreDueno` es la patente con guion o el nombre del conductor.
 */
export function mensajeRepetido(tipo: TipoDocumento, dueno: TipoDueno, nombreDueno: string) {
  const femenino = FEMENINO[tipo];
  const etiqueta = tipo === "soap" ? "SOAP" : ETIQUETA_TIPO_DOCUMENTO[tipo].toLowerCase();
  const quien = dueno === "vehiculo" ? `El vehículo ${nombreDueno}` : nombreDueno;
  return femenino
    ? `${quien} ya tiene una ${etiqueta} registrada. Edítala para renovarla.`
    : `${quien} ya tiene un ${etiqueta} registrado. Edítalo para renovarlo.`;
}
