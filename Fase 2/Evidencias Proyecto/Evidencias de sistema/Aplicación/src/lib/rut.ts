// Funciones para el RUT chileno. Se usan en conductores y en la empresa.

const FORMATO = /^[0-9]{7,8}-[0-9K]$/;

// Deja el RUT en un solo formato (11111111-1) antes de validarlo o guardarlo.
export function normalizarRut(valor: string) {
  const limpio = valor.toUpperCase().replace(/[\s.-]/g, "");
  if (limpio.length < 2) return limpio;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

// Calcula el dígito verificador con módulo 11.
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

export function tieneFormatoDeRut(rut: string) {
  return FORMATO.test(rut);
}

export function esRutValido(rut: string) {
  if (!tieneFormatoDeRut(rut)) return false;
  const [cuerpo, digito] = rut.split("-");
  return digitoVerificador(cuerpo) === digito;
}

// Para mostrar el RUT con puntos: 11.111.111-1.
export function formatearRut(rut: string) {
  const [cuerpo, digito] = rut.split("-");
  if (!digito) return rut;
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${digito}`;
}
