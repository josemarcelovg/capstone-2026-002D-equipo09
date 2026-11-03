import assert from "node:assert/strict";
import { test } from "node:test";
import {
  diasEntre,
  esFechaValida,
  fechaDesdeBase,
  fechaParaBase,
  formatearFecha,
  hoyEnChile,
  leerFecha,
  sumarAnios,
  sumarDias,
} from "../src/lib/fechas.ts";

// Casos tomados de JOA-10 (secciones 2, 5 y 6), JOA-13 (sección 2) y JOA-14 (sección 2).
// En diciembre Chile está en UTC−3 y en julio, en UTC−4.

test("a las 23:30 de Chile sigue siendo el mismo día, aunque en UTC ya sea mañana", () => {
  assert.equal(hoyEnChile(new Date("2026-12-02T02:30:00Z")), "2026-12-01");
  assert.equal(hoyEnChile(new Date("2026-07-01T03:30:00Z")), "2026-06-30");
});

test("a medianoche de Chile cambia el día", () => {
  assert.equal(hoyEnChile(new Date("2026-12-02T03:00:00Z")), "2026-12-02");
  assert.equal(hoyEnChile(new Date("2026-07-01T04:00:00Z")), "2026-07-01");
});

test("el proceso de alertas de las 11:00 UTC calcula el mismo día en Chile todo el año", () => {
  assert.equal(hoyEnChile(new Date("2026-12-01T11:00:00Z")), "2026-12-01");
  assert.equal(hoyEnChile(new Date("2026-07-01T11:00:00Z")), "2026-07-01");
});

test("sin argumento usa el momento actual y devuelve AAAA-MM-DD", () => {
  assert.match(hoyEnChile(), /^\d{4}-\d{2}-\d{2}$/);
});

test("acepta fechas que existen, incluido el 29 de febrero de un año bisiesto", () => {
  for (const fecha of ["2026-12-01", "2027-02-28", "2028-02-29", "2026-12-31"]) {
    assert.ok(esFechaValida(fecha), fecha);
  }
});

test("rechaza fechas que no existen o con otro formato", () => {
  for (const fecha of ["2027-02-31", "2027-02-29", "2026-13-01", "2026-00-10", "01-12-2026", "", "hoy"]) {
    assert.equal(esFechaValida(fecha), false, fecha);
  }
});

test("suma y resta días, también al cruzar meses, años y cambios de horario", () => {
  assert.equal(sumarDias("2026-12-01", 30), "2026-12-31");
  assert.equal(sumarDias("2026-12-01", -1), "2026-11-30");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
  assert.equal(sumarDias("2026-10-27", 60), "2026-12-26");
  assert.equal(sumarDias("2026-09-05", 2), "2026-09-07");
  assert.equal(sumarDias("2026-04-04", 1), "2026-04-05");
});

test("suma años para el rango de vencimientos: hoy − 5 años y hoy + 10 años", () => {
  assert.equal(sumarAnios("2026-12-01", -5), "2021-12-01");
  assert.equal(sumarAnios("2026-12-01", 10), "2036-12-01");
  assert.equal(sumarAnios("2028-02-29", 1), "2029-02-28");
  assert.equal(sumarAnios("2028-02-29", 4), "2032-02-29");
});

test("cuenta los días que faltan, con los ejemplos de JOA-10", () => {
  const hoy = "2026-12-01";
  assert.equal(diasEntre(hoy, "2026-12-31"), 30);
  assert.equal(diasEntre(hoy, "2026-12-01"), 0);
  assert.equal(diasEntre(hoy, "2026-11-30"), -1);
  assert.equal(diasEntre(hoy, "2027-01-01"), 31);
  assert.equal(diasEntre("2026-09-05", "2026-09-07"), 2);
});

test("lee la fecha como la escribe el usuario o como la entrega un campo de tipo fecha", () => {
  assert.equal(leerFecha("01-12-2026"), "2026-12-01");
  assert.equal(leerFecha("1/12/2026"), "2026-12-01");
  assert.equal(leerFecha(" 31-12-2026 "), "2026-12-31");
  assert.equal(leerFecha("2026-12-01"), "2026-12-01");
  assert.equal(leerFecha("29-02-2028"), "2028-02-29");
});

test("no lee fechas vacías, inexistentes o incompletas", () => {
  for (const valor of ["", "   ", "31-02-2027", "29-02-2027", "01-13-2026", "01-12-26", "12-2026", "mañana"]) {
    assert.equal(leerFecha(valor), null, valor);
  }
});

test("muestra la fecha como DD-MM-AAAA", () => {
  assert.equal(formatearFecha("2026-12-01"), "01-12-2026");
  assert.equal(formatearFecha("2027-06-15"), "15-06-2027");
  assert.equal(formatearFecha("sin fecha"), "sin fecha");
});

test("convierte las columnas date de Prisma sin correr el día", () => {
  assert.equal(fechaDesdeBase(new Date("2026-12-01T00:00:00Z")), "2026-12-01");
  assert.equal(fechaParaBase("2026-12-01").toISOString(), "2026-12-01T00:00:00.000Z");
  assert.equal(fechaDesdeBase(fechaParaBase("2028-02-29")), "2028-02-29");
});
