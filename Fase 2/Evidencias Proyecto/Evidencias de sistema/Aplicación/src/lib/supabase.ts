import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase para páginas y acciones del servidor. Solo se usa para la
// autenticación: los datos se leen y guardan con Prisma (src/lib/prisma.ts).
// Se crea uno por solicitud, como pide @supabase/ssr. El proxy (src/proxy.ts) usa
// su propio cliente porque ahí las cookies se leen de la solicitud.

export async function crearClienteSupabase(url: string, clave: string) {
  const almacen = await cookies();
  return createServerClient(url, clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(cookiesNuevas) {
        try {
          for (const { name, value, options } of cookiesNuevas) almacen.set(name, value, options);
        } catch {
          // Una página no puede escribir cookies (las acciones sí). En ese caso la
          // sesión ya la renovó el proxy antes de llegar aquí.
        }
      },
    },
  });
}
