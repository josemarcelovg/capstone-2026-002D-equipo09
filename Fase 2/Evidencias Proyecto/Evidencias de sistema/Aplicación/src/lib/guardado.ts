export const SIN_CONEXION = "No pudimos guardar. Revisa tu conexión e intenta nuevamente.";

// Llama a una acción del servidor desde un formulario. Si se corta la conexión, muestra un aviso
// y no se pierde lo que se había escrito.
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
