import { z } from "zod";

// Campos, formatos y mensajes del vehículo según JOA-01 (secciones 3 y 4).
// El formulario y el servidor validan con este mismo esquema.

export const TIPOS = ["bus", "minibus", "van", "furgon", "automovil", "otro"] as const;
export const ESTADOS = ["activo", "en_mantencion", "inactivo"] as const;

export type Tipo = (typeof TIPOS)[number];
export type Estado = (typeof ESTADOS)[number];

export const ETIQUETA_TIPO: Record<Tipo, string> = {
  bus: "Bus",
  minibus: "Minibús",
  van: "Van",
  furgon: "Furgón",
  automovil: "Automóvil",
  otro: "Otro",
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  activo: "Activo",
  en_mantencion: "En mantención",
  inactivo: "Inactivo",
};

const ANIO_MINIMO = 1980;
const PATENTE = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;

/** `bb-cd 12` → `BBCD12`. Así se valida y se guarda. */
export function normalizarPatente(valor: string) {
  return valor.toUpperCase().replace(/[\s.-]/g, "");
}

/** `BBCD12` → `BBCD-12`. Solo para mostrar. */
export function formatearPatente(patente: string) {
  return patente.replace(/^([A-Z]{4}|[A-Z]{2})(\d+)$/, "$1-$2");
}

const texto = (min: number, max: number, mensaje: string) =>
  z.string({ error: mensaje }).trim().min(min, mensaje).max(max, mensaje);

const textoOpcional = (max: number, mensaje: string) =>
  z
    .string({ error: mensaje })
    .trim()
    .max(max, mensaje)
    .nullish()
    .transform((valor) => valor || null);

const entero = (min: number, max: number, mensaje: string) =>
  z.coerce.number({ error: mensaje }).int(mensaje).min(min, mensaje).max(max, mensaje);

export function esquemaVehiculo(anioActual = new Date().getFullYear()) {
  const anioMaximo = anioActual + 1;
  const patenteVacia = "Ingresa la patente del vehículo.";

  return z.object({
    patente: z
      .string({ error: patenteVacia })
      .transform(normalizarPatente)
      .pipe(
        z
          .string()
          .min(1, patenteVacia)
          .regex(PATENTE, "La patente debe tener el formato BBCD12 o AB1234."),
      ),
    tipo: z.enum(TIPOS, { error: "Selecciona el tipo de vehículo." }),
    marca: texto(2, 50, "Ingresa la marca (entre 2 y 50 caracteres)."),
    modelo: texto(1, 50, "Ingresa el modelo (máximo 50 caracteres)."),
    anio: entero(
      ANIO_MINIMO,
      anioMaximo,
      `El año debe estar entre ${ANIO_MINIMO} y ${anioMaximo}.`,
    ),
    capacidadPasajeros: entero(1, 100, "La capacidad debe ser un número entre 1 y 100."),
    numeroInterno: textoOpcional(20, "El número interno puede tener hasta 20 caracteres."),
    color: textoOpcional(30, "El color puede tener hasta 30 caracteres."),
    estado: z.enum(ESTADOS, { error: "Selecciona un estado válido." }).default("activo"),
    observaciones: textoOpcional(500, "Las observaciones pueden tener hasta 500 caracteres."),
  });
}

export type DatosVehiculo = z.infer<ReturnType<typeof esquemaVehiculo>>;
export type Vehiculo = DatosVehiculo & { id: string };
export type ErroresVehiculo = Partial<Record<keyof DatosVehiculo | "general", string>>;

/** Valida los datos de un formulario y devuelve un error por campo. */
export function validarVehiculo(
  datos: unknown,
  anioActual?: number,
): { ok: true; datos: DatosVehiculo } | { ok: false; errores: ErroresVehiculo } {
  const resultado = esquemaVehiculo(anioActual).safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresVehiculo = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof DatosVehiculo;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}
