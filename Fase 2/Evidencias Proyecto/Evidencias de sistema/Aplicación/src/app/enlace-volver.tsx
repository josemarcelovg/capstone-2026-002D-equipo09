"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { listadoParaVolver } from "@/lib/navegacion";

/** Enlace de la página "No encontrado" al listado de la sección donde se estaba. */
export function EnlaceVolver({ className }: { className?: string }) {
  const { href, texto } = listadoParaVolver(usePathname());
  return (
    <Link href={href} className={className}>
      {texto}
    </Link>
  );
}
