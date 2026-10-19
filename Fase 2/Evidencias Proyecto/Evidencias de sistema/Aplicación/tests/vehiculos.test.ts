import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatearPatente,
  normalizarPatente,
  validarVehiculo,
} from "../src/lib/vehiculos.ts";

// Casos tomados de JOA-01, secciones 3.1, 4 y 6.

const valido = {
  patente: "FGHJ-34",
  tipo: "van",
  marca: "Mercedes-Benz",
  modelo: "Sprinter 515",
  anio: "2021",
  capacidadPasajeros: "19",
  estado: "activo",
};

function errores(cambios: Record<string, unknown>) {
  const resultado = validarVehiculo({ ...valido, ...cambios }, 2026);
  return resultado.ok ? {} : resultado.errores;
}

test("normaliza la patente a mayúsculas y sin separadores", () => {
  assert.equal(normalizarPatente("bb-cd 12"), "BBCD12");
  assert.equal(normalizarPatente("fghj-34"), "FGHJ34");
  assert.equal(normalizarPatente("ab.1234"), "AB1234");
});

test("muestra la patente con guion", () => {
  assert.equal(formatearPatente("BBCD12"), "BBCD-12");
  assert.equal(formatearPatente("AB1234"), "AB-1234");
});

test("acepta los ejemplos válidos y guarda la patente normalizada", () => {
  const actual = validarVehiculo(valido, 2026);
  assert.ok(actual.ok);
  assert.equal(actual.datos.patente, "FGHJ34");
  assert.equal(actual.datos.anio, 2021);
  assert.equal(actual.datos.capacidadPasajeros, 19);
  assert.equal(actual.datos.numeroInterno, null);

  const antiguo = validarVehiculo(
    { ...valido, patente: "ab 1234", tipo: "bus", estado: "en_mantencion" },
    2026,
  );
  assert.ok(antiguo.ok);
  assert.equal(antiguo.datos.patente, "AB1234");
});

test("el estado por defecto es activo", () => {
  const sinEstado = validarVehiculo({ ...valido, estado: undefined }, 2026);
  assert.ok(sinEstado.ok);
  assert.equal(sinEstado.datos.estado, "activo");
});

test("rechaza patentes vacías o con formato inválido", () => {
  assert.equal(errores({ patente: "" }).patente, "Ingresa la patente del vehículo.");
  assert.equal(errores({ patente: " - " }).patente, "Ingresa la patente del vehículo.");
  assert.equal(
    errores({ patente: "ABC123" }).patente,
    "La patente debe tener el formato BBCD12 o AB1234.",
  );
});

test("rechaza años fuera de rango", () => {
  const mensaje = "El año debe estar entre 1980 y 2027.";
  assert.equal(errores({ anio: "1975" }).anio, mensaje);
  assert.equal(errores({ anio: "2030" }).anio, mensaje);
  assert.equal(errores({ anio: "" }).anio, mensaje);
  assert.equal(errores({ anio: "2027" }).anio, undefined);
});

test("rechaza capacidades fuera de rango o no numéricas", () => {
  const mensaje = "La capacidad debe ser un número entre 1 y 100.";
  for (const capacidadPasajeros of ["0", "150", "veinte", "12.5", ""]) {
    assert.equal(errores({ capacidadPasajeros }).capacidadPasajeros, mensaje);
  }
});

test("rechaza tipos y estados que no existen", () => {
  assert.ok(errores({ tipo: "camion" }).tipo);
  assert.ok(errores({ estado: "eliminado" }).estado);
});

test("ignora el empresa_id enviado en el formulario", () => {
  const actual = validarVehiculo({ ...valido, empresa_id: "otra" }, 2026);
  assert.ok(actual.ok);
  assert.equal("empresa_id" in actual.datos, false);
});
