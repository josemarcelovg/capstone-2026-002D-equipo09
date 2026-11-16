import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase para el servidor. Solo se usa para el inicio de sesión; los datos van con Prisma.

export async function crearClienteSupabase(url: string, clave: string) {
  const almacen = await cookies();
  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(cookiesNuevas) {
        try {
          for (const { name, value, options } of cookiesNuevas) almacen.set(name, value, options);
        } catch {
          // Las páginas no pueden escribir cookies; en ese caso el proxy ya renovó la sesión.
        }
      },
    },
  });
}
