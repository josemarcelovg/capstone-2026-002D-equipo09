import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { usuarioDeLaSesion, type UsuarioDeLaSesion } from "@/lib/sesion";
import { cerrarSesion } from "./login/acciones";

/** Enlaces del encabezado y cierre de sesión. Sin sesión no muestra nada. */
export async function MenuSesion() {
  let usuario: UsuarioDeLaSesion | null = null;
  try {
    usuario = await usuarioDeLaSesion();
  } catch (error) {
    // Si falla la base de datos o la configuración, la página muestra su propio error.
    unstable_rethrow(error);
  }
  if (!usuario) return null;

  return (
    <>
      <Link href="/vehiculos" className="text-sm font-medium text-zinc-800 hover:underline">
        Vehículos
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-zinc-600 sm:inline">{usuario.empresaNombre}</span>
        {usuario.modo === "supabase" ? (
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Cerrar sesión
            </button>
          </form>
        ) : (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            Modo desarrollo
          </span>
        )}
      </div>
    </>
  );
}
