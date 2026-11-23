import assert from "node:assert/strict";
import { test } from "node:test";
import { ESTADOS_DOCUMENTO } from "../src/lib/documentos.ts";
import {
  ENLACES_RESUMEN,
  ETIQUETA_VEHICULOS,
  MENSAJES_RESUMEN,
  situacionDocumentos,
  textoVencenHoy,
} from "../src/lib/resumen.ts";
import { ESTADOS } from "../src/lib/vehiculos.ts";

// Resumen de la flota (JOA-50): textos, enlaces y qué se muestra en el bloque de documentos.

const documentos = (cambios: Partial<Record<"total" | "vencidos" | "porVencer" | "vencenHoy", number>>) => ({
  total: 0,
  vencidos: 0,
  porVencer: 0,
  vencenHoy: 0,
  ...cambios,
});

test("«vencen hoy» se escribe en singular o plural, y no aparece si no vence ninguno (JOA-50, criterio 3)", () => {
  assert.equal(textoVencenHoy(0), null);
  assert.equal(textoVencenHoy(1), "1 vence hoy");
  assert.equal(textoVencenHoy(3), "3 vencen hoy");
});

test("sin documentos se invita a registrar; con documentos sin avisos, «al día» (JOA-50, criterios 8 y 9)", () => {
  assert.equal(situacionDocumentos(documentos({})), "sin-documentos");
  assert.equal(situacionDocumentos(documentos({ total: 4 })), "al-dia");
  assert.equal(situacionDocumentos(documentos({ total: 4, vencidos: 1 })), "con-avisos");
  assert.equal(situacionDocumentos(documentos({ total: 4, porVencer: 2, vencenHoy: 1 })), "con-avisos");
  assert.equal(
    MENSAJES_RESUMEN.alDia,
    "Tus documentos están al día: ninguno vencido ni por vencer en los próximos 30 días.",
  );
});

test("cada número lleva a su listado con el filtro de JOA-50, sección 3 (criterios 2 y 5)", () => {
  assert.deepEqual(ENLACES_RESUMEN, {
    activo: "/vehiculos?estado=activo",
    en_mantencion: "/vehiculos?estado=en_mantencion",
    inactivo: "/vehiculos?estado=inactivo&inactivos=1",
    totalVehiculos: "/vehiculos?inactivos=1",
    vencidos: "/documentos?estado=vencido",
    porVencer: "/documentos?estado=por_vencer",
  });

  // Los filtros usan valores que los listados reconocen; si no, mostrarían otra cantidad.
  const estado = (enlace: string) => new URL(enlace, "https://micrologist.example").searchParams.get("estado");
  for (const vehiculo of ESTADOS) assert.equal(estado(ENLACES_RESUMEN[vehiculo]), vehiculo);
  for (const enlace of [ENLACES_RESUMEN.vencidos, ENLACES_RESUMEN.porVencer]) {
    assert.ok(ESTADOS_DOCUMENTO.some((opcion) => opcion === estado(enlace)), enlace);
  }
});

test("los tres estados de los vehículos tienen su nombre escrito (JOA-50, sección 4)", () => {
  assert.deepEqual(ESTADOS.map((estado) => ETIQUETA_VEHICULOS[estado]), ["Activos", "En mantención", "Inactivos"]);
});
