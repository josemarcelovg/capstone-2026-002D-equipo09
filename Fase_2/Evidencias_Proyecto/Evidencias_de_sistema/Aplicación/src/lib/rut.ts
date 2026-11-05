// RUT chileno según JOA-09 (sección 3.1). Sin dependencias, para probarlo directo
// y reutilizarlo en el RUT de la empresa (PB-14).

const FORMATO = /^[0-9]{7,8}-[0-9K]$/;

/**
 * `11.111.111-1` → `11111111-1`; `1000005k` → `1000005-K`.
 * Quita puntos, espacios y guion, pasa la `k` a mayúscula y pone el guion antes del
 * último carácter. No valida: un texto inválido sigue siendo inválido después de esto.
 */
export function normalizarRut(valor: string) {
  const limpio = valor.toUpperCase().replace(/[\s.-]/g, "");
  if (limpio.length < 2) return limpio;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

/** Dígito verificador del cuerpo del RUT (módulo 11). */
export function digitoVerificador(cuerpo: string) {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
}

/** El RUT ya normalizado tiene de 7 a 8 dígitos, guion y dígito verificador. */
export function tieneFormatoDeRut(rut: string) {
  return FORMATO.test(rut);
}

/** El RUT ya normalizado tiene formato válido y su dígito verificador coincide. */
export function esRutValido(rut: string) {
  if (!tieneFormatoDeRut(rut)) return false;
  const [cuerpo, digito] = rut.split("-");
  return digitoVerificador(cuerpo) === digito;
}

/** `11111111-1` → `11.111.111-1`. Solo para mostrar. */
export function formatearRut(rut: string) {
  const [cuerpo, digito] = rut.split("-");
  if (!digito) return rut;
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${digito}`;
}
