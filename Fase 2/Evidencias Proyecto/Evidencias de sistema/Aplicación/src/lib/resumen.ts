import type { Estado } from "./vehiculos.ts";

// Resumen de la flota de la pantalla de inicio (JOA-50): textos, enlaces y qué mostrar.
// Los totales los calcula resumen-datos.ts.

export type ResumenFlota = {
  vehiculos: Record<Estado, number> & { total: number };
  // Solo cuenta los documentos de vehículos no inactivos y de conductores activos.
  documentos: { total: number; vencidos: number; porVencer: number; vencenHoy: number };
};

export const ETIQUETA_VEHICULOS: Record<Estado, string> = {
  activo: "Activos",
  en_mantencion: "En mantención",
  inactivo: "Inactivos",
};

// A qué listado lleva cada número (JOA-50, sección 3). Ese listado muestra la misma cantidad.
export const ENLACES_RESUMEN = {
  activo: "/vehiculos?estado=activo",
  en_mantencion: "/vehiculos?estado=en_mantencion",
  inactivo: "/vehiculos?estado=inactivo&inactivos=1",
  totalVehiculos: "/vehiculos?inactivos=1",
  vencidos: "/documentos?estado=vencido",
  porVencer: "/documentos?estado=por_vencer",
} as const;

export const MENSAJES_RESUMEN = {
  sinVehiculos: "Todavía no tienes vehículos registrados.",
  sinDocumentos: "Todavía no tienes documentos registrados.",
  alDia: "Tus documentos están al día: ninguno vencido ni por vencer en los próximos 30 días.",
};

// "1 vence hoy" o "3 vencen hoy". Si no vence ninguno, no se muestra.
export function textoVencenHoy(cantidad: number) {
  if (cantidad === 0) return null;
  return cantidad === 1 ? "1 vence hoy" : `${cantidad} vencen hoy`;
}

// Qué se muestra en el bloque de documentos: el mensaje para registrar, el de "al día" o los números.
export function situacionDocumentos({ total, vencidos, porVencer }: ResumenFlota["documentos"]) {
  if (total === 0) return "sin-documentos";
  return vencidos + porVencer === 0 ? "al-dia" : "con-avisos";
}
