// Fechas sin hora en hora de Chile (SIM-09). Las usan el estado de los documentos (JOA-10,
// sección 3.4), las fechas de los turnos (JOA-14) y el proceso diario de alertas (JOA-13).
// Una fecha sin hora se maneja como texto `AAAA-MM-DD`: así se compara y se ordena como
// texto, y el resultado no depende de la zona horaria del servidor.

export const ZONA_HORARIA_CHILE = "America/Santiago";

const DIA_MS = 24 * 60 * 60 * 1000;
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}$/;

const formateadorChile = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA_CHILE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Fecha de hoy en Chile, como `AAAA-MM-DD`. El servidor corre en otra zona horaria: entre
 * las 21:00 y las 23:59 de Chile su fecha ya es la de mañana (JOA-10, sección 2).
 */
export function hoyEnChile(ahora: Date = new Date()) {
  const partes = Object.fromEntries(
    formateadorChile.formatToParts(ahora).map((parte) => [parte.type, parte.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}

// La aritmética se hace a medianoche UTC, donde todos los días duran 24 horas; así los
// cambios de horario de Chile no corren ningún cálculo en un día.
function aMilisegundos(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

function desdeMilisegundos(milisegundos: number) {
  return new Date(milisegundos).toISOString().slice(0, 10);
}

/** `2027-02-28` es válida; `2027-02-31`, `2026-13-01` o `01-12-2026` no. */
export function esFechaValida(fecha: string) {
  return FORMATO_ISO.test(fecha) && desdeMilisegundos(aMilisegundos(fecha)) === fecha;
}

/** `2026-12-01` + 30 → `2026-12-31`. Acepta días negativos. */
export function sumarDias(fecha: string, dias: number) {
  return desdeMilisegundos(aMilisegundos(fecha) + dias * DIA_MS);
}

/**
 * `2026-12-01` + 10 → `2036-12-01`. Un 29 de febrero que cae en un año no bisiesto queda en
 * el 28. Sirve para el rango de vencimientos de los documentos (JOA-10, sección 2).
 */
export function sumarAnios(fecha: string, anios: number) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const ultimoDiaDelMes = new Date(Date.UTC(anio + anios, mes, 0)).getUTCDate();
  return desdeMilisegundos(Date.UTC(anio + anios, mes - 1, Math.min(dia, ultimoDiaDelMes)));
}

/** Días de calendario de `desde` a `hasta`: negativo si `hasta` ya pasó. */
export function diasEntre(desde: string, hasta: string) {
  return Math.round((aMilisegundos(hasta) - aMilisegundos(desde)) / DIA_MS);
}
