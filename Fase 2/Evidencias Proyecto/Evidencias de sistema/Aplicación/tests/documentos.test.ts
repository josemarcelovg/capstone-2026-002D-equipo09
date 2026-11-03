import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calcularEstado,
  describirVencimiento,
  DIAS_POR_VENCER,
  esUnicoPorDueno,
  mensajeDuenoInactivo,
  mensajeRepetido,
  rangoDeEstado,
  rangoDeFechas,
  tipoDeDueno,
  tiposPara,
  validarDocumento,
} from "../src/lib/documentos.ts";

// Casos tomados de JOA-10, secciones 2 a 5. Como en sus ejemplos, hoy es 01-12-2026 en Chile.

const HOY = "2026-12-01";
const VEHICULO = "a1000000-0000-4000-8000-000000000001";
const CONDUCTOR = "c1000000-0000-4000-8000-000000000001";

const soap = { tipo: "soap", vehiculoId: VEHICULO, conductorId: "", fechaVencimiento: "15-06-2027" };

function errores(datos: Record<string, unknown>) {
  const resultado = validarDocumento(datos, HOY);
  return resultado.ok ? {} : resultado.errores;
}

test("cada tipo tiene su dueño (sección 3.1)", () => {
  assert.deepEqual(tiposPara("vehiculo"), ["revision_tecnica", "soap", "permiso_circulacion", "otro"]);
  assert.deepEqual(tiposPara("conductor"), ["licencia_conducir", "otro"]);
  assert.equal(esUnicoPorDueno("soap"), true);
  assert.equal(esUnicoPorDueno("licencia_conducir"), true);
  assert.equal(esUnicoPorDueno("otro"), false);
});

test("calcula el estado de los ejemplos de la sección 5.1", () => {
  assert.deepEqual(calcularEstado("2027-06-15", HOY), { estado: "vigente", dias: 196 });
  assert.deepEqual(calcularEstado("2026-12-31", HOY), { estado: "por_vencer", dias: 30 });
  assert.deepEqual(calcularEstado("2026-12-01", HOY), { estado: "por_vencer", dias: 0 });
  assert.deepEqual(calcularEstado("2026-11-30", HOY), { estado: "vencido", dias: -1 });
  assert.deepEqual(calcularEstado("2027-01-01", HOY), { estado: "vigente", dias: 31 });
});

test("el día del vencimiento todavía es válido y al día siguiente vence (criterio 5)", () => {
  assert.equal(calcularEstado("2026-12-01", "2026-12-01").estado, "por_vencer");
  assert.equal(calcularEstado("2026-12-01", "2026-12-02").estado, "vencido");
  assert.equal(DIAS_POR_VENCER, 30);
});

test("describe el vencimiento con texto, no solo con color (sección 3.2)", () => {
  assert.equal(describirVencimiento("2027-06-15", HOY), "Vence el 15-06-2027");
  assert.equal(describirVencimiento("2026-12-31", HOY), "Vence en 30 días");
  assert.equal(describirVencimiento("2026-12-02", HOY), "Vence mañana");
  assert.equal(describirVencimiento("2026-12-01", HOY), "Vence hoy");
  assert.equal(describirVencimiento("2026-11-30", HOY), "Venció ayer");
  assert.equal(describirVencimiento("2026-11-21", HOY), "Venció hace 10 días");
});

test("los rangos de cada estado calzan con calcularEstado", () => {
  assert.deepEqual(rangoDeEstado("vencido", HOY), { hasta: "2026-11-30" });
  assert.deepEqual(rangoDeEstado("por_vencer", HOY), { desde: "2026-12-01", hasta: "2026-12-31" });
  assert.deepEqual(rangoDeEstado("vigente", HOY), { desde: "2027-01-01" });

  for (const fecha of ["2026-11-30", "2026-12-01", "2026-12-31", "2027-01-01"]) {
    const { estado } = calcularEstado(fecha, HOY);
    const { desde, hasta } = rangoDeEstado(estado, HOY);
    assert.ok((!desde || fecha >= desde) && (!hasta || fecha <= hasta), `${fecha} en ${estado}`);
  }
});

test("acepta los documentos válidos de la sección 5.1", () => {
  const casos = [
    { tipo: "revision_tecnica", vehiculoId: VEHICULO, fechaVencimiento: "15-06-2027" },
    { tipo: "permiso_circulacion", vehiculoId: VEHICULO, fechaVencimiento: "31-12-2026" },
    { tipo: "licencia_conducir", conductorId: CONDUCTOR, descripcion: "Clase A3", fechaVencimiento: "01-12-2026" },
    { tipo: "otro", vehiculoId: VEHICULO, descripcion: "Seguro de pasajeros", fechaVencimiento: "30-11-2026" },
    { tipo: "otro", conductorId: CONDUCTOR, descripcion: "Curso de primeros auxilios", fechaVencimiento: "01-01-2027" },
  ];
  for (const caso of casos) {
    const resultado = validarDocumento(caso, HOY);
    assert.ok(resultado.ok, `${caso.tipo}: ${JSON.stringify(resultado.ok ? "" : resultado.errores)}`);
  }
});

test("guarda la fecha como AAAA-MM-DD y deja vacíos los campos opcionales", () => {
  const resultado = validarDocumento({ ...soap, descripcion: "  ", observaciones: "" }, HOY);
  assert.ok(resultado.ok);
  assert.deepEqual(resultado.datos, {
    tipo: "soap",
    vehiculoId: VEHICULO,
    conductorId: null,
    descripcion: null,
    fechaVencimiento: "2027-06-15",
    observaciones: null,
  });
  assert.equal(tipoDeDueno(resultado.datos), "vehiculo");
});

test("acepta la fecha del campo de tipo fecha (AAAA-MM-DD)", () => {
  const resultado = validarDocumento({ ...soap, fechaVencimiento: "2027-06-15" }, HOY);
  assert.ok(resultado.ok);
  assert.equal(resultado.datos.fechaVencimiento, "2027-06-15");
});

test("rechaza el tipo que no corresponde al dueño (sección 5.2)", () => {
  assert.deepEqual(errores({ tipo: "soap", conductorId: CONDUCTOR, fechaVencimiento: "15-06-2027" }), {
    dueno: "Ese tipo de documento no corresponde a un conductor.",
  });
  assert.deepEqual(errores({ tipo: "licencia_conducir", vehiculoId: VEHICULO, fechaVencimiento: "15-06-2027" }), {
    dueno: "Ese tipo de documento no corresponde a un vehículo.",
  });
});

test("pide el dueño según el tipo", () => {
  assert.deepEqual(errores({ ...soap, vehiculoId: "" }), {
    vehiculoId: "Selecciona el vehículo al que pertenece el documento.",
  });
  assert.deepEqual(errores({ tipo: "licencia_conducir", fechaVencimiento: "15-06-2027" }), {
    conductorId: "Selecciona el conductor al que pertenece la licencia.",
  });
  assert.equal(
    errores({ tipo: "otro", descripcion: "Seguro", fechaVencimiento: "15-06-2027" }).dueno,
    "Indica si el documento es de un vehículo o de un conductor.",
  );
});

test("un documento tiene un solo dueño (sección 5.2)", () => {
  assert.ok(errores({ tipo: "otro", descripcion: "Seguro", vehiculoId: VEHICULO, conductorId: CONDUCTOR, fechaVencimiento: "15-06-2027" }).dueno);
});

test("la descripción es obligatoria solo para el tipo otro", () => {
  assert.deepEqual(errores({ tipo: "otro", vehiculoId: VEHICULO, fechaVencimiento: "15-06-2027" }), {
    descripcion: "Describe el documento (entre 2 y 100 caracteres).",
  });
  assert.ok(errores({ ...soap, descripcion: "A" }).descripcion);
  assert.ok(errores({ ...soap, descripcion: "x".repeat(101) }).descripcion);
  assert.ok(validarDocumento({ ...soap, descripcion: "Póliza 123" }, HOY).ok);
});

test("rechaza la fecha vacía o inexistente (criterio 4)", () => {
  const mensaje = "Ingresa la fecha de vencimiento (DD-MM-AAAA).";
  assert.equal(errores({ ...soap, fechaVencimiento: "" }).fechaVencimiento, mensaje);
  assert.equal(errores({ ...soap, fechaVencimiento: "31-02-2027" }).fechaVencimiento, mensaje);
  assert.equal(errores({ ...soap, fechaVencimiento: undefined }).fechaVencimiento, mensaje);
});

test("rechaza la fecha fuera de rango y acepta una pasada dentro del rango (criterio 4)", () => {
  assert.deepEqual(rangoDeFechas(HOY), { minima: "2021-12-01", maxima: "2036-12-01" });
  const mensaje = "La fecha debe estar entre 01-12-2021 y 01-12-2036.";
  assert.equal(errores({ ...soap, fechaVencimiento: "01-12-2062" }).fechaVencimiento, mensaje);
  assert.equal(errores({ ...soap, fechaVencimiento: "01-12-2015" }).fechaVencimiento, mensaje);
  assert.ok(validarDocumento({ ...soap, fechaVencimiento: "01-12-2021" }, HOY).ok);
  assert.ok(validarDocumento({ ...soap, fechaVencimiento: "01-12-2036" }, HOY).ok);
  assert.ok(validarDocumento({ ...soap, fechaVencimiento: "30-11-2026" }, HOY).ok);
});

test("rechaza un tipo que no existe y observaciones demasiado largas", () => {
  assert.equal(errores({ ...soap, tipo: "pasaporte" }).tipo, "Selecciona el tipo de documento.");
  assert.equal(errores({ ...soap, tipo: "" }).tipo, "Selecciona el tipo de documento.");
  assert.equal(
    errores({ ...soap, observaciones: "x".repeat(501) }).observaciones,
    "Las observaciones pueden tener hasta 500 caracteres.",
  );
});

test("ignora el empresa_id que venga en el formulario", () => {
  const resultado = validarDocumento({ ...soap, empresaId: "b0000000-0000-4000-8000-000000000002" }, HOY);
  assert.ok(resultado.ok);
  assert.equal("empresaId" in resultado.datos, false);
});

test("mensajes de dueño inactivo y documento repetido (sección 4)", () => {
  assert.equal(mensajeDuenoInactivo("vehiculo"), "No puedes agregar documentos a un vehículo inactivo. Reactívalo primero.");
  assert.equal(mensajeDuenoInactivo("conductor"), "No puedes agregar documentos a un conductor inactivo. Reactívalo primero.");
  assert.equal(
    mensajeRepetido("soap", "vehiculo", "BBCD-12"),
    "El vehículo BBCD-12 ya tiene un SOAP registrado. Edítalo para renovarlo.",
  );
  assert.equal(
    mensajeRepetido("licencia_conducir", "conductor", "Pedro Soto"),
    "Pedro Soto ya tiene una licencia de conducir registrada. Edítala para renovarla.",
  );
  assert.equal(
    mensajeRepetido("revision_tecnica", "vehiculo", "BBCD-12"),
    "El vehículo BBCD-12 ya tiene una revisión técnica registrada. Edítala para renovarla.",
  );
});
