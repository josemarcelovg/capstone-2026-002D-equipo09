import type { ReactNode } from "react";

// Íconos de la interfaz, dibujados con SVG simple para no agregar dependencias. Son solo
// decorativos (aria-hidden): cada uno va siempre junto a un texto que dice lo mismo.

type PropsIcono = { className?: string };

function Icono({ className = "size-5", children }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Marca de MicroLogist y menú de vehículos. */
export function IconoBus(props: PropsIcono) {
  return (
    <Icono {...props}>
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <path d="M4 11h16M8 6.5h8" />
      <circle cx="8" cy="14.5" r="0.6" fill="currentColor" />
      <circle cx="16" cy="14.5" r="0.6" fill="currentColor" />
      <path d="M7 18v2.5M17 18v2.5" />
    </Icono>
  );
}

export function IconoConductor(props: PropsIcono) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Icono>
  );
}

export function IconoDocumento(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Icono>
  );
}

export function IconoEmpresa(props: PropsIcono) {
  return (
    <Icono {...props}>
      <rect x="4" y="3" width="12" height="18" rx="1.5" />
      <path d="M16 9h3a1 1 0 0 1 1 1v11M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1M2 21h20" />
    </Icono>
  );
}

export function IconoMas(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icono>
  );
}

export function IconoBuscar(props: PropsIcono) {
  return (
    <Icono {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Icono>
  );
}

export function IconoFlecha(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icono>
  );
}

export function IconoSalir(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
    </Icono>
  );
}

export function IconoMenu(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icono>
  );
}

export function IconoAlerta(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4M12 17h.01" />
    </Icono>
  );
}

export function IconoReloj(props: PropsIcono) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icono>
  );
}

export function IconoOjo(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icono>
  );
}

export function IconoOjoTachado(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M9.9 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </Icono>
  );
}

export function IconoEscudo(props: PropsIcono) {
  return (
    <Icono {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </Icono>
  );
}

export function IconoVigente(props: PropsIcono) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />
    </Icono>
  );
}
