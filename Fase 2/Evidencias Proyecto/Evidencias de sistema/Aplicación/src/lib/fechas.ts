// Funciones para trabajar con fechas en hora de Chile. Las fechas se guardan como texto
// AAAA-MM-DD para que no dependan de la zona horaria del servidor.

export const ZONA_HORARIA_CHILE = "America/Santiago";

const DIA_MS = 24 * 60 * 60 * 1000;
const FORMATO_ISO = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_CHILENO = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;

const formateadorChile = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA_CHILE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Fecha de hoy en Chile. El servidor usa otra zona horaria y en la noche ya estaría en mañana.
export function hoyEnChile(ahora: Date = new Date()) {
  const partes = Object.fromEntries(
    formateadorChile.formatToParts(ahora).map((parte) => [parte.type, parte.value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}

// Se calcula a medianoche UTC para que los cambios de horario no afecten los días.
function aMilisegundos(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

function desdeMilisegundos(milisegundos: number) {
  return new Date(milisegundos).toISOString().slice(0, 10);
}

// Revisa que la fecha exista de verdad (por ejemplo, que no sea 31 de febrero).
export function esFechaValida(fecha: string) {
  return FORMATO_ISO.test(fecha) && desdeMilisegundos(aMilisegundos(fecha)) === fecha;
}

export function sumarDias(fecha: string, dias: number) {
  return desdeMilisegundos(aMilisegundos(fecha) + dias * DIA_MS);
}

// Suma años. Un 29 de febrero que cae en año no bisiesto queda en 28.
export function sumarAnios(fecha: string, anios: number) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const ultimoDiaDelMes = new Date(Date.UTC(anio + anios, mes, 0)).getUTCDate();
  return desdeMilisegundos(Date.UTC(anio + anios, mes - 1, Math.min(dia, ultimoDiaDelMes)));
}

// Días que faltan entre dos fechas (negativo si ya pasó).
export function diasEntre(desde: string, hasta: string) {
  return Math.round((aMilisegundos(hasta) - aMilisegundos(desde)) / DIA_MS);
}

// Lee la fecha que escribe el usuario (01-12-2026, 1/12/2026 o 2026-12-01). Devuelve null si no existe.
export function leerFecha(valor: string) {
  const texto = valor.trim();
  const chileno = FORMATO_CHILENO.exec(texto);
  const fecha = chileno
    ? `${chileno[3]}-${chileno[2].padStart(2, "0")}-${chileno[1].padStart(2, "0")}`
    : texto;
  return esFechaValida(fecha) ? fecha : null;
}

// Para mostrar la fecha como DD-MM-AAAA.
export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  if (!dia) return fecha;
  return `${dia}-${mes}-${anio}`;
}

// Prisma entrega las columnas de fecha a medianoche UTC; estas dos funciones hacen la conversión.
export function fechaDesdeBase(valor: Date) {
  return desdeMilisegundos(valor.getTime());
}

export function fechaParaBase(fecha: string) {
  return new Date(aMilisegundos(fecha));
}
