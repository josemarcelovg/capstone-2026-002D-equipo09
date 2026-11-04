import assert from "node:assert/strict";
import { test } from "node:test";
import {
  documentoDeLaEmpresa,
  documentosDelDueno,
  DUENO_ACTIVO,
  filtroDocumentos,
} from "../src/lib/documentos-filtros.ts";
import { fichaDelDueno, nombreDelDocumento } from "../src/lib/documentos.ts";

// Filtros del listado de documentos y de la ficha (JOA-10, secciones 2, 3.4 y 4).
// Como en los ejemplos de JOA-10, hoy es 01-12-2026 en Chile.

const HOY = "2026-12-01";
const EMPRESA = "a0000000-0000-4000-8000-000000000001";
const VEHICULO = "a1000000-0000-4000-8000-000000000001";
const CONDUCTOR = "c1000000-0000-4000-8000-000000000001";

const dia = (fecha: string) => new Date(`${fecha}T00:00:00.000Z`);

test("toda consulta lleva la empresa, también al buscar por id (criterios 13 y 14)", () => {
  assert.deepEqual(documentoDeLaEmpresa("d1", EMPRESA), { id: "d1", empresaId: EMPRESA });
  assert.equal(filtroDocumentos(EMPRESA, HOY).empresaId, EMPRESA);
  assert.equal(documentosDelDueno(EMPRESA, { tipo: "vehiculo", id: VEHICULO }).empresaId, EMPRESA);
});

test("sin filtros trae todos los estados y tipos, solo de dueños activos (criterio 8)", () => {
  assert.deepEqual(filtroDocumentos(EMPRESA, HOY), {
    empresaId: EMPRESA,
    tipo: undefined,
    fechaVencimiento: undefined,
    ...DUENO_ACTIVO,
  });
});

test("dueño activo es un vehículo no inactivo (en mantención cuenta) o un conductor activo", () => {
  assert.deepEqual(DUENO_ACTIVO, {
    OR: [{ vehiculo: { estado: { not: "inactivo" } } }, { conductor: { activo: true } }],
  });
});

test("«Incluir inactivos» quita el filtro del dueño activo (criterio 8)", () => {
  const filtro = filtroDocumentos(EMPRESA, HOY, { incluirInactivos: true });
  assert.equal("OR" in filtro, false);
});

test("el estado se filtra con el rango de fechas que le corresponde (criterios 5 y 7)", () => {
  // Vencido: hasta ayer.
  assert.deepEqual(filtroDocumentos(EMPRESA, HOY, { estado: "vencido" }).fechaVencimiento, {
    gte: undefined,
    lte: dia("2026-11-30"),
  });
  // Por vencer: de hoy (vence hoy) a 30 días más.
  assert.deepEqual(filtroDocumentos(EMPRESA, HOY, { estado: "por_vencer" }).fechaVencimiento, {
    gte: dia("2026-12-01"),
    lte: dia("2026-12-31"),
  });
  // Vigente: desde el día 31.
  assert.deepEqual(filtroDocumentos(EMPRESA, HOY, { estado: "vigente" }).fechaVencimiento, {
    gte: dia("2027-01-01"),
    lte: undefined,
  });
});

test("el tipo y el estado se combinan (criterio 7)", () => {
  const filtro = filtroDocumentos(EMPRESA, HOY, { tipo: "soap", estado: "vencido" });
  assert.equal(filtro.tipo, "soap");
  assert.deepEqual(filtro.fechaVencimiento, { gte: undefined, lte: dia("2026-11-30") });
});

test("la ficha trae los documentos de ese dueño, aunque esté inactivo (criterio 9)", () => {
  assert.deepEqual(documentosDelDueno(EMPRESA, { tipo: "vehiculo", id: VEHICULO }), {
    empresaId: EMPRESA,
    vehiculoId: VEHICULO,
  });
  assert.deepEqual(documentosDelDueno(EMPRESA, { tipo: "conductor", id: CONDUCTOR }), {
    empresaId: EMPRESA,
    conductorId: CONDUCTOR,
  });
});

test("nombre del documento para los listados", () => {
  assert.equal(nombreDelDocumento({ tipo: "soap", descripcion: null }), "SOAP");
  assert.equal(
    nombreDelDocumento({ tipo: "licencia_conducir", descripcion: "Clase A3" }),
    "Licencia de conducir (Clase A3)",
  );
  assert.equal(nombreDelDocumento({ tipo: "otro", descripcion: "Seguro de pasajeros" }), "Seguro de pasajeros");
});

test("la ficha del dueño", () => {
  assert.equal(fichaDelDueno({ tipo: "vehiculo", id: VEHICULO }), `/vehiculos/${VEHICULO}`);
  assert.equal(fichaDelDueno({ tipo: "conductor", id: CONDUCTOR }), `/conductores/${CONDUCTOR}`);
});
