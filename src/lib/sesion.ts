// Empresa del usuario que inició sesión. El empresa_id nunca viene del formulario:
// el servidor lo toma de aquí (JOA-01, sección 2.4).
//
// SIM-02 reemplaza el contenido de esta función por la sesión de Supabase Auth:
// buscar en `usuario` el perfil con el id del usuario autenticado y devolver su
// empresaId; sin sesión, redirigir al inicio de sesión.
//
// Mientras tanto, solo en desarrollo, se usa la empresa de EMPRESA_DESARROLLO_ID
// (ver .env.example). En producción falla, para no mostrar datos sin sesión.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function empresaDeLaSesion(): Promise<string> {
  const empresa = process.env.EMPRESA_DESARROLLO_ID ?? "";
  if (process.env.NODE_ENV === "production" || !UUID.test(empresa)) {
    throw new Error("No hay una sesión iniciada (pendiente SIM-02).");
  }
  return empresa;
}
