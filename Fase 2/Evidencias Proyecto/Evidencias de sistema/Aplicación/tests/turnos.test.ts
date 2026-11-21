import assert from "node:assert/strict";
import { test } from "node:test";
import {
  avisosDelTurno,
  DIAS_PARA_PLANIFICAR,
  ETIQUETA_JORNADA,
  JORNADAS,
  mensajeConductorInactivo,
  mensajeConductorOcupado,
  mensajeVehiculoNoActivo,
  mensajeVehiculoOcupado,
  preguntaAnular,
  rangoDeFechasTurno,
  sePuedeModificar,
  textoTurnosFuturos,
  validarAnulacion,
  validarTurno,
} from "../src/lib/turnos.ts";

// Ejemplos de JOA-14, sección 5: hoy es 27-10-2026 en Chile.

const HOY = "2026-10-27";
const VEHICULO = "a1000000-0000-4000-8000-000000000001";
const CONDUCTOR = "c1000000-0000-4000-8000-000000000001";

const turno = (cambios: Record<string, unknown> = {}) => ({
  fecha: "28-10-2026",
  jornada: "tarde",
  vehiculoId: VEHICULO,
  conductorId: CONDUCTOR,
  ...cambios,
});

function errores(datos: Record<string, unknown>) {
  const resultado = validarTurno(datos, HOY);
  return resultado.ok ? {} : resultado.errores;
}

test("las jornadas son mañana, tarde y noche (sección 2)", () => {
  assert.deepEqual(JORNADAS, ["manana", "tarde", "noche"]);
  assert.deepEqual(Object.values(ETIQUETA_JORNADA), ["Mañana", "Tarde", "Noche"]);
});

test("se puede planificar desde hoy hasta 60 días adelante (sección 2)", () => {
  assert.equal(DIAS_PARA_PLANIFICAR, 60);
  assert.deepEqual(rangoDeFechasTurno(HOY), { minima: "2026-10-27", maxima: "2026-12-26" });
});

test("acepta los ejemplos válidos de la sección 5.1", () => {
  for (const [fecha, jornada] of [
    ["28-10-2026", "tarde"],
    ["28-10-2026", "manana"],
    ["27-10-2026", "noche"],
    ["26-12-2026", "manana"],
  ]) {
    const resultado = validarTurno(turno({ fecha, jornada }), HOY);
    assert.equal(resultado.ok, true, `${fecha} ${jornada}`);
  }
});

test("guarda la fecha como AAAA-MM-DD y acepta los dos formatos", () => {
  const resultado = validarTurno(turno({ fecha: "2026-11-05" }), HOY);
  assert.deepEqual(resultado, {
    ok: true,
    datos: { fecha: "2026-11-05", jornada: "tarde", vehiculoId: VEHICULO, conductorId: CONDUCTOR },
  });
  assert.equal(validarTurno(turno({ fecha: "5/11/2026" }), HOY).ok, true);
});

test("una fecha pasada o a más de 60 días muestra su error (criterio 4)", () => {
  const mensaje = "La fecha debe estar entre hoy y el 26-12-2026.";
  assert.equal(errores(turno({ fecha: "26-10-2026" })).fecha, mensaje);
  assert.equal(errores(turno({ fecha: "27-12-2026" })).fecha, mensaje);
});

test("pide cada campo con su mensaje (sección 4)", () => {
  assert.deepEqual(errores({ fecha: "", jornada: "", vehiculoId: "", conductorId: "" }), {
    fecha: "Selecciona la fecha del turno.",
    jornada: "Selecciona la jornada.",
    vehiculoId: "Selecciona el vehículo.",
    conductorId: "Selecciona el conductor.",
  });
  assert.deepEqual(errores({}), {
    fecha: "Selecciona la fecha del turno.",
    jornada: "Selecciona la jornada.",
    vehiculoId: "Selecciona el vehículo.",
    conductorId: "Selecciona el conductor.",
  });
});

test("rechaza una fecha que no existe y una jornada inventada (sección 5.2)", () => {
  assert.equal(errores(turno({ fecha: "31-02-2027" })).fecha, "Selecciona la fecha del turno.");
  assert.equal(errores(turno({ jornada: "madrugada" })).jornada, "Selecciona la jornada.");
});

test("ignora la empresa enviada en el formulario (sección 5.2)", () => {
  const resultado = validarTurno(turno({ empresaId: "b0000000-0000-4000-8000-000000000002" }), HOY);
  assert.equal(resultado.ok, true);
  if (resultado.ok) assert.equal("empresaId" in resultado.datos, false);
});

test("solo se modifican los turnos de hoy en adelante que no están anulados (criterio 9)", () => {
  assert.equal(sePuedeModificar({ fecha: HOY, anulado: false }, HOY), true);
  assert.equal(sePuedeModificar({ fecha: "2026-11-15", anulado: false }, HOY), true);
  assert.equal(sePuedeModificar({ fecha: "2026-10-26", anulado: false }, HOY), false);
  assert.equal(sePuedeModificar({ fecha: "2026-11-15", anulado: true }, HOY), false);
});

test("arma los mensajes de vehículo o conductor no disponibles (sección 4)", () => {
  assert.equal(mensajeVehiculoNoActivo("BBCD12"), "El vehículo BBCD-12 no está activo y no se puede asignar.");
  assert.equal(mensajeConductorInactivo("Pedro Soto"), "Pedro Soto está inactivo y no se puede asignar.");
  assert.equal(
    mensajeVehiculoOcupado("BBCD12", "2026-12-15", "manana"),
    "BBCD-12 ya tiene un turno el 15-12-2026 en la mañana.",
  );
  assert.equal(
    mensajeConductorOcupado("Pedro Soto", "2026-12-15", "manana"),
    "Pedro Soto ya tiene un turno el 15-12-2026 en la mañana.",
  );
});

test("pide confirmación para anular con los datos del turno (sección 3.2)", () => {
  assert.equal(
    preguntaAnular({ fecha: "2026-12-15", jornada: "manana", patente: "BBCD12", conductor: "Pedro Soto" }),
    "¿Anular el turno de la mañana del 15-12-2026 (BBCD-12 · Pedro Soto)?",
  );
});

test("el motivo de anulación es opcional y tiene hasta 200 caracteres (sección 3.2)", () => {
  assert.deepEqual(validarAnulacion({ motivo: "  " }), { ok: true, motivo: null });
  assert.deepEqual(validarAnulacion({}), { ok: true, motivo: null });
  assert.deepEqual(validarAnulacion({ motivo: " Conductor con licencia médica " }), {
    ok: true,
    motivo: "Conductor con licencia médica",
  });
  assert.equal(validarAnulacion({ motivo: "a".repeat(200) }).ok, true);
  assert.deepEqual(validarAnulacion({ motivo: "a".repeat(201) }), {
    ok: false,
    error: "El motivo puede tener hasta 200 caracteres.",
  });
});

test("muestra los avisos de cada turno en texto (criterio 8)", () => {
  assert.deepEqual(avisosDelTurno({ anulado: false, estadoVehiculo: "activo", conductorActivo: true }), []);
  assert.deepEqual(avisosDelTurno({ anulado: false, estadoVehiculo: "en_mantencion", conductorActivo: true }), [
    "Vehículo en mantención",
  ]);
  assert.deepEqual(avisosDelTurno({ anulado: true, estadoVehiculo: "inactivo", conductorActivo: false }), [
    "Anulado",
    "Vehículo inactivo",
    "Conductor inactivo",
  ]);
});

test("indica cuántos turnos tiene al desactivar un vehículo o conductor (criterio 11)", () => {
  assert.equal(textoTurnosFuturos(0), null);
  assert.equal(textoTurnosFuturos(1), "Tiene 1 turno desde hoy. No se anula: quedará con un aviso para reasignarlo.");
  assert.equal(
    textoTurnosFuturos(3),
    "Tiene 3 turnos desde hoy. No se anulan: quedarán con un aviso para reasignarlos.",
  );
});
