import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { usuarioDeLaSesion, type UsuarioDeLaSesion } from "@/lib/sesion";
import { EnlaceMenu } from "./enlace-menu";
import { BOTON_SECUNDARIO } from "./estilos";
import {
  IconoBus,
  IconoConductor,
  IconoDocumento,
  IconoEmpresa,
  IconoMenu,
  IconoSalir,
} from "./iconos";
import { cerrarSesion } from "./login/acciones";
import { Logo } from "./logo";

/**
 * Menú principal: lateral en computador y desplegable en celular, con la empresa de la sesión
 * y el cierre de sesión. Sin sesión no muestra nada.
 */
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
      {/* Celular: la marca y un botón "Menú" que despliega las mismas opciones. */}
      <header className="relative flex items-center justify-between border-b border-stone-200 bg-stone-100 px-4 py-3 md:hidden">
        <Marca />
        <details className="group">
          <summary className={`${BOTON_SECUNDARIO} cursor-pointer list-none px-3 py-1.5`}>
            <IconoMenu className="size-4" />
            Menú
          </summary>
          <div className="absolute inset-x-0 top-full z-20 border-b border-stone-200 bg-stone-100 px-4 pb-4 pt-2 shadow-lg">
            <Navegacion />
            <PieDelMenu usuario={usuario} />
          </div>
        </details>
      </header>

      {/* Computador: menú lateral fijo a la izquierda. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-stone-100 px-4 py-6 md:flex">
        <Marca />
        <div className="mt-8 flex-1">
          <Navegacion />
        </div>
        <PieDelMenu usuario={usuario} />
      </aside>
    </>
  );
}

function Marca() {
  return (
    <Link href="/" className="rounded-lg px-1">
      <Logo />
    </Link>
  );
}

function Navegacion() {
  return (
    <nav aria-label="Principal">
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
        Flota
      </p>
      <ul className="grid gap-1">
        <li>
          <EnlaceMenu href="/vehiculos">
            <IconoBus />
            Vehículos
          </EnlaceMenu>
        </li>
        <li>
          <EnlaceMenu href="/conductores">
            <IconoConductor />
            Conductores
          </EnlaceMenu>
        </li>
        <li>
          <EnlaceMenu href="/documentos">
            <IconoDocumento />
            Documentos
          </EnlaceMenu>
        </li>
      </ul>
      <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-stone-600">
        Cuenta
      </p>
      <ul className="grid gap-1">
        <li>
          <EnlaceMenu href="/empresa">
            <IconoEmpresa />
            Mi empresa
          </EnlaceMenu>
        </li>
      </ul>
    </nav>
  );
}

function PieDelMenu({ usuario }: { usuario: UsuarioDeLaSesion }) {
  return (
    <div className="mt-6 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <p className="text-xs text-stone-600">Empresa</p>
      <p className="truncate text-sm font-semibold text-stone-900" title={usuario.empresaNombre}>
        {usuario.empresaNombre}
      </p>
      {usuario.modo === "supabase" ? (
        <form action={cerrarSesion} className="mt-3">
          <button type="submit" className={`${BOTON_SECUNDARIO} w-full py-2`}>
            <IconoSalir className="size-4" />
            Cerrar sesión
          </button>
        </form>
      ) : (
        <span className="mt-2 inline-block rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
          Modo desarrollo
        </span>
      )}
    </div>
  );
}
