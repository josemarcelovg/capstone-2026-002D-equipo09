import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accesoDelEntorno, debeRedirigirAlLogin, RUTA_LOGIN } from "@/lib/acceso";

// Se ejecuta antes de cada página: renueva la sesión y manda al login a quien no la tiene.
// Igual cada página vuelve a revisar la sesión por su cuenta.

export async function proxy(request: NextRequest) {
  const acceso = accesoDelEntorno();
  if (acceso.modo !== "supabase") return NextResponse.next();

  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(acceso.url, acceso.clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesNuevas, encabezados) {
        for (const { name, value } of cookiesNuevas) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of cookiesNuevas) {
          respuesta.cookies.set(name, value, options);
        }
        for (const [nombre, valor] of Object.entries(encabezados)) {
          respuesta.headers.set(nombre, valor);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  const redirigir = debeRedirigirAlLogin({
    ruta: request.nextUrl.pathname,
    conSesion: Boolean(data?.claims),
    esAccion: request.headers.has("next-action"),
  });
  if (!redirigir) return respuesta;

  const login = NextResponse.redirect(new URL(RUTA_LOGIN, request.url));
  for (const cookie of respuesta.cookies.getAll()) login.cookies.set(cookie);
  return login;
}

export const config = {
  // Todo menos los archivos estáticos (CSS, JS e imágenes).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
