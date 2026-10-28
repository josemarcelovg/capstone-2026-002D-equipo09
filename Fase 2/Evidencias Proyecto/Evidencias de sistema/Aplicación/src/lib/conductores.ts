import { z } from "zod";
import { esRutValido, normalizarRut, tieneFormatoDeRut } from "./rut.ts";

// Campos, formatos y mensajes del conductor según JOA-09 (secciones 3 y 4).
// El formulario y el servidor validan con este mismo esquema.
// Importa rut.ts con ruta relativa para que las pruebas lo carguen sin Next.js.

/** `  Juan   Pérez ` → `Juan Pérez`. */
export function normalizarNombre(valor: string) {
  return valor.trim().replace(/\s+/g, " ");
}

/**
 * `9 1234 5678`, `+56 9 1234 5678` o `(2) 2345 6789` → solo dígitos, sin el código de país.
 * No valida: un texto inválido sigue siendo inválido después de esto.
 */
export function digitosDeTelefono(valor: string) {
  const digitos = valor.replace(/[\s.()+-]/g, "");
  return digitos.length === 11 && digitos.startsWith("56") ? digitos.slice(2) : digitos;
}

/** `+56912345678` → `+56 9 1234 5678`; `+56223456789` → `+56 2 2345 6789`. Solo para mostrar. */
export function formatearTelefono(telefono: string) {
  return telefono.replace(/^\+56(\d)(\d{4})(\d{4})$/, "+56 $1 $2 $3");
}

const MENSAJES = {
  nombre: "El nombre debe tener entre 2 y 100 caracteres.",
  nombreVacio: "Ingresa el nombre del conductor.",
  rutVacio: "Ingresa el RUT del conductor.",
  rutFormato: "El RUT debe tener el formato 12345678-9.",
  rutDigito: "El RUT no es válido. Revisa el dígito verificador.",
  telefonoVacio: "Ingresa el teléfono del conductor.",
  telefono: "El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.",
  email: "Ingresa un correo válido o deja el campo vacío.",
};

export const esquemaConductor = z.object({
  nombre: z
    .string({ error: MENSAJES.nombreVacio })
    .transform(normalizarNombre)
    .pipe(z.string().min(1, MENSAJES.nombreVacio).min(2, MENSAJES.nombre).max(100, MENSAJES.nombre)),
  rut: z
    .string({ error: MENSAJES.rutVacio })
    .transform(normalizarRut)
    .pipe(
      z
        .string()
        .min(1, MENSAJES.rutVacio)
        .refine(tieneFormatoDeRut, MENSAJES.rutFormato)
        .refine(esRutValido, { message: MENSAJES.rutDigito, abort: true }),
    ),
  telefono: z
    .string({ error: MENSAJES.telefonoVacio })
    .transform(digitosDeTelefono)
    .pipe(z.string().min(1, MENSAJES.telefonoVacio).regex(/^\d{9}$/, MENSAJES.telefono))
    .transform((digitos) => `+56${digitos}`),
  email: z
    .string({ error: MENSAJES.email })
    .trim()
    .toLowerCase()
    .nullish()
    .transform((valor) => valor || null)
    .pipe(z.email(MENSAJES.email).max(254, MENSAJES.email).nullable()),
});

export type DatosConductor = z.infer<typeof esquemaConductor>;
export type Conductor = DatosConductor & { id: string; activo: boolean };
export type ErroresConductor = Partial<Record<keyof DatosConductor | "general", string>>;

/** Valida los datos de un formulario y devuelve un error por campo. */
export function validarConductor(
  datos: unknown,
): { ok: true; datos: DatosConductor } | { ok: false; errores: ErroresConductor } {
  const resultado = esquemaConductor.safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresConductor = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof DatosConductor;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}
