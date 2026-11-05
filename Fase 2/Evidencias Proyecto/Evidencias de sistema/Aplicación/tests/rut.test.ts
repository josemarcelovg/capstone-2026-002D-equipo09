import assert from "node:assert/strict";
import { test } from "node:test";
import {
  digitoVerificador,
  esRutValido,
  formatearRut,
  normalizarRut,
  tieneFormatoDeRut,
} from "../src/lib/rut.ts";

// Casos tomados de JOA-09, secciones 3.1 y 5. Solo RUT ficticios (dígitos repetidos).

test("normaliza puntos, espacios, guion y la k minúscula", () => {
  assert.equal(normalizarRut("11.111.111-1"), "11111111-1");
  assert.equal(normalizarRut("22.222.222-2"), "22222222-2");
  assert.equal(normalizarRut("1000005k"), "1000005-K");
  assert.equal(normalizarRut("1000005-k"), "1000005-K");
  assert.equal(normalizarRut(" 33 333 333 3 "), "33333333-3");
  assert.equal(normalizarRut(""), "");
});

test("calcula el dígito verificador, incluidos K y 0", () => {
  assert.equal(digitoVerificador("11111111"), "1");
  assert.equal(digitoVerificador("99999999"), "9");
  assert.equal(digitoVerificador("1000005"), "K");
  assert.equal(digitoVerificador("1000013"), "0");
});

test("acepta los RUT válidos de los ejemplos", () => {
  for (const rut of ["11111111-1", "22222222-2", "1000005-K", "1000013-0", "99999999-9"]) {
    assert.ok(esRutValido(rut), rut);
  }
});

test("rechaza un dígito verificador incorrecto", () => {
  assert.equal(tieneFormatoDeRut("11111111-2"), true);
  assert.equal(esRutValido("11111111-2"), false);
  assert.equal(esRutValido("1000005-0"), false);
});

test("rechaza cuerpos de menos de 7 o más de 8 dígitos", () => {
  assert.equal(esRutValido(normalizarRut("123456-7")), false);
  assert.equal(esRutValido(normalizarRut("123456789-0")), false);
});

test("rechaza letras, vacíos y dígitos verificadores que no existen", () => {
  for (const valor of ["", "abc", "11111111-X", "1111111A-1", "-", "K"]) {
    assert.equal(esRutValido(normalizarRut(valor)), false, valor);
  }
});

test("muestra el RUT con puntos", () => {
  assert.equal(formatearRut("11111111-1"), "11.111.111-1");
  assert.equal(formatearRut("1000005-K"), "1.000.005-K");
  assert.equal(formatearRut("111111111"), "111111111");
});
