import assert from "node:assert/strict";
import { test } from "node:test";
import { listadoParaVolver } from "../src/lib/navegacion.ts";

// La página "No encontrado" ofrece volver al listado de la sección donde se estaba
// (SIM-08 y SIM-12, observaciones de la página "No encontrado").

const ID = "a1000000-0000-4000-8000-000000000001";

test("desde un documento, un conductor o un vehículo vuelve a su propio listado", () => {
  assert.deepEqual(listadoParaVolver(`/documentos/${ID}`), {
    href: "/documentos",
    texto: "Volver al listado de documentos",
  });
  assert.deepEqual(listadoParaVolver("/documentos/nuevo"), {
    href: "/documentos",
    texto: "Volver al listado de documentos",
  });
  assert.deepEqual(listadoParaVolver(`/conductores/${ID}`), {
    href: "/conductores",
    texto: "Volver al listado de conductores",
  });
  assert.deepEqual(listadoParaVolver(`/vehiculos/${ID}`), {
    href: "/vehiculos",
    texto: "Volver al listado de vehículos",
  });
});

test("una sección solo cuenta si la ruta empieza con ella", () => {
  assert.equal(listadoParaVolver("/documentosx").href, "/vehiculos");
  assert.equal(listadoParaVolver("/otra/documentos").href, "/vehiculos");
});

test("en cualquier otra dirección vuelve al listado de vehículos, que es el inicio", () => {
  for (const ruta of ["/", "/no-existe", "", null]) {
    assert.deepEqual(listadoParaVolver(ruta), {
      href: "/vehiculos",
      texto: "Volver al listado de vehículos",
    });
  }
});
