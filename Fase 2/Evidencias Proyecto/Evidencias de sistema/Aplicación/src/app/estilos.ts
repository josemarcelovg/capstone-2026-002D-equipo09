// Clases de Tailwind que se repiten en varias pantallas, para que el diseño sea igual en toda la app.

export const BOTON_PRINCIPAL =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-orange-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800 disabled:opacity-60";

export const BOTON_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-50";

// Campos de los formularios y filtros
export const CONTROL =
  "mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/25 aria-invalid:border-red-600";

export const TARJETA = "rounded-xl border border-stone-200 bg-white shadow-sm";

export const ETIQUETA_PATENTE =
  "inline-block whitespace-nowrap rounded-md bg-orange-100 px-2 py-0.5 font-semibold tracking-wide text-orange-900";
