/**
 * Logo de MicroLogist: un volante con el centro naranja y el nombre. El volante es decorativo
 * (aria-hidden); el nombre se lee como texto. `claro` es para fondos oscuros.
 */
export function Logo({ grande = false, claro = false }: { grande?: boolean; claro?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-bold tracking-tight ${
        claro ? "text-white" : "text-stone-900"
      } ${grande ? "text-2xl" : "text-lg"}`}
    >
      <svg
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={grande ? "size-9" : "size-7"}
      >
        <circle cx="13" cy="13" r="10.5" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="13" cy="13" r="2.6" fill="#ea580c" />
        <path
          d="M3 11.5h7.5M15.5 11.5H23M13 15.5V23"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      MicroLogist
    </span>
  );
}
