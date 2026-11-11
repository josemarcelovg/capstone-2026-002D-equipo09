"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/**
 * Enlace del menú principal. Marca la sección en la que se está (`aria-current="page"`) y,
 * en el celular, cierra el menú desplegable al elegir una opción.
 */
export function EnlaceMenu({ href, children }: { href: string; children: ReactNode }) {
  const ruta = usePathname();
  const activo = ruta === href || ruta.startsWith(`${href}/`);

  function cerrarMenu(evento: MouseEvent<HTMLAnchorElement>) {
    evento.currentTarget.closest("details")?.removeAttribute("open");
  }

  return (
    <Link
      href={href}
      onClick={cerrarMenu}
      aria-current={activo ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        activo
          ? "bg-orange-700 text-white shadow-sm"
          : "text-stone-700 hover:bg-stone-200/70 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}
