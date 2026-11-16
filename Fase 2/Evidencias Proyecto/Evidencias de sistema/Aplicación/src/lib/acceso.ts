import { z } from "zod";

// Reglas del inicio de sesión. No dependen de Next.js para poder probarlas directo.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Única pantalla que se puede abrir sin sesión.
export const RUTA_LOGIN = "/login";

// La llama Vercel Cron, que no tiene sesión: se protege con CRON_SECRET.
export const RUTA_AVISOS = "/api/avisos";

const esquemaCredenciales = z.object({
  correo: z
    .string({ error: "Ingresa tu correo." })
    .trim()
    .toLowerCase()
    .min(1, "Ingresa tu correo.")
    .pipe(z.email("Ingresa un correo válido.")),
  contrasena: z.string({ error: "Ingresa tu contraseña." }).min(1, "Ingresa tu contraseña."),
});

export type Credenciales = z.infer<typeof esquemaCredenciales>;
export type ErroresAcceso = Partial<Record<keyof Credenciales | "general", string>>;

// Valida el formulario de inicio de sesión y devuelve un mensaje por campo.
export function validarCredenciales(
  datos: unknown,
): { ok: true; datos: Credenciales } | { ok: false; errores: ErroresAcceso } {
  const resultado = esquemaCredenciales.safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };

  const errores: ErroresAcceso = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as keyof Credenciales;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

// Mensaje de error del inicio de sesión. Nunca dice si el correo existe o no.
export function mensajeDeErrorDeAcceso(error: { status?: number; code?: string; message?: string }) {
  if (error.status === 429 || error.code === "over_request_rate_limit") {
    return "Demasiados intentos. Espera unos minutos e intenta nuevamente.";
  }
  if (error.status === 400 || error.status === 422) return "Correo o contraseña incorrectos.";
  return "No pudimos iniciar sesión. Intenta nuevamente.";
}

export type ModoDeAcceso =
  | { modo: "supabase"; url: string; clave: string }
  | { modo: "desarrollo"; empresaId: string }
  | { modo: "sin-configurar"; motivo: string };

// Decide cómo se sabe la empresa del usuario: con Supabase Auth, con EMPRESA_DESARROLLO_ID
// (solo en desarrollo) o, si falta configuración, no se muestran datos.
export function modoDeAcceso(entorno: {
  url?: string;
  clave?: string;
  empresaDesarrollo?: string;
  produccion: boolean;
}): ModoDeAcceso {
  const url = entorno.url?.trim() ?? "";
  const clave = entorno.clave?.trim() ?? "";

  if (url && clave) return { modo: "supabase", url, clave };
  if (url || clave) {
    return {
      modo: "sin-configurar",
      motivo: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }
  if (entorno.produccion) {
    return { modo: "sin-configurar", motivo: "En producción se necesita Supabase Auth." };
  }
  const empresaId = entorno.empresaDesarrollo?.trim() ?? "";
  if (!UUID.test(empresaId)) {
    return { modo: "sin-configurar", motivo: "EMPRESA_DESARROLLO_ID no es un UUID válido." };
  }
  return { modo: "desarrollo", empresaId };
}

export function accesoDelEntorno() {
  return modoDeAcceso({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    clave: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    empresaDesarrollo: process.env.EMPRESA_DESARROLLO_ID,
    produccion: process.env.NODE_ENV === "production",
  });
}

// Decide si el proxy manda al login. Las acciones y la ruta de avisos revisan el acceso por su cuenta.
export function debeRedirigirAlLogin(solicitud: {
  ruta: string;
  conSesion: boolean;
  esAccion: boolean;
}) {
  if (solicitud.conSesion || solicitud.esAccion) return false;
  return ![RUTA_LOGIN, RUTA_AVISOS].some(
    (ruta) => solicitud.ruta === ruta || solicitud.ruta.startsWith(`${ruta}/`),
  );
}
