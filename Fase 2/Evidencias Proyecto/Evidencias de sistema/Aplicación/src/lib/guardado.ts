/** Aviso cuando la solicitud de guardar no llega al servidor (por ejemplo, sin conexión). */
export const SIN_CONEXION = "No pudimos guardar. Revisa tu conexión e intenta nuevamente.";

/**
 * Llama a una acción del servidor desde un formulario o un botón. Si la solicitud falla, devuelve
 * `siFalla` en vez de lanzar el error: así el formulario muestra el aviso y conserva lo escrito,
 * en lugar de cambiar a la pantalla de error (ERR-02, SIM-13). `relanzar` deja pasar los errores
 * internos de Next.js, como la redirección al listado después de guardar (`unstable_rethrow`).
 */
export async function llamarAlServidor<T>(
  accion: () => Promise<T>,
  siFalla: T,
  relanzar: (error: unknown) => void,
): Promise<T> {
  try {
    return await accion();
  } catch (error) {
    relanzar(error);
    return siFalla;
  }
}
