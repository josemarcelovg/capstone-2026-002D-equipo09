import { z } from "zod";
import { digitosDeTelefono, normalizarNombre } from "./conductores.ts";
import { esRutValido, normalizarRut, tieneFormatoDeRut } from "./rut.ts";

// Datos de la empresa: nombre y correo obligatorios, teléfono y RUT opcionales.
// El correo recibe los avisos de vencimiento. El RUT, una vez ingresado, no se cambia.

const MENSAJES = {
  nombreVacio: "Ingresa el nombre de la empresa.",
  nombre: "El nombre debe tener entre 2 y 100 caracteres.",
  email: "Ingresa un correo válido.",
  telefono: "El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.",
  rutFormato: "El RUT debe tener el formato 12345678-9.",
  rutDigito: "El RUT no es válido. Revisa el dígito verificador.",
};

// Un texto vacío cuenta como sin valor.
const vacioANulo = (valor: unknown) =>
  valor === undefined || (typeof valor === "string" && valor.trim() === "") ? null : valor;

export const esquemaEmpresa = z.object({
  nombre: z
    .string({ error: MENSAJES.nombreVacio })
    .transform(normalizarNombre)
    .pipe(z.string().min(1, MENSAJES.nombreVacio).min(2, MENSAJES.nombre).max(100, MENSAJES.nombre)),
  emailContacto: z
    .string({ error: MENSAJES.email })
    .trim()
    .toLowerCase()
    .pipe(z.email(MENSAJES.email).max(254, MENSAJES.email)),
  telefono: z.preprocess(
    vacioANulo,
    z
      .string({ error: MENSAJES.telefono })
      .transform(digitosDeTelefono)
      .pipe(z.string().regex(/^\d{9}$/, MENSAJES.telefono))
      .transform((digitos) => `+56${digitos}`)
      .nullable(),
  ),
  rut: z.preprocess(
    vacioANulo,
    z
      .string({ error: MENSAJES.rutFormato })
      .transform(normalizarRut)
      .pipe(
        z
          .string()
          .refine(tieneFormatoDeRut, MENSAJES.rutFormato)
          .refine(esRutValido, { message: MENSAJES.rutDigito, abort: true }),
      )
      .nullable(),
  ),
});

export type DatosEmpresa = z.infer<typeof esquemaEmpresa>;
export type ErroresEmpresa = Partial<Record<keyof DatosEmpresa | "general", string>>;

// Valida el formulario. Si la empresa ya tiene RUT, se mantiene el guardado.
export function validarEmpresa(
  datos: unknown,
  rutGuardado: string | null = null,
): { ok: true; datos: DatosEmpresa } | { ok: false; errores: ErroresEmpresa } {
  const entrada = rutGuardado && datos && typeof datos === "object" ? { ...datos, rut: "" } : datos;
  const resultado = esquemaEmpresa.safeParse(entrada);
  if (resultado.success) {
    return { ok: true, datos: { ...resultado.data, rut: rutGuardado ?? resultado.data.rut } };
  }

  const errores: ErroresEmpresa = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof DatosEmpresa;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

// Si cambió el correo, se pide confirmación antes de guardar.
export function cambiaElCorreo(anterior: string, nuevo: string) {
  return anterior.trim().toLowerCase() !== nuevo.trim().toLowerCase();
}
