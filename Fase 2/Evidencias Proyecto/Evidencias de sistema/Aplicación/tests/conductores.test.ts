import assert from "node:assert/strict";
import { test } from "node:test";
import {
  digitosDeTelefono,
  formatearTelefono,
  normalizarNombre,
  validarConductor,
} from "../src/lib/conductores.ts";

// Casos tomados de JOA-09, secciones 3, 4 y 5. Solo RUT ficticios.

const valido = {
  nombre: "Juan Pérez",
  rut: "22.222.222-2",
  telefono: "9 1234 5678",
  email: "",
};

function errores(cambios: Record<string, unknown>) {
  const resultado = validarConductor({ ...valido, ...cambios });
  return resultado.ok ? {} : resultado.errores;
}

test("normaliza el nombre y el teléfono", () => {
  assert.equal(normalizarNombre("  Juan   Pérez "), "Juan Pérez");
  assert.equal(digitosDeTelefono("+56 9 1234 5678"), "912345678");
  assert.equal(digitosDeTelefono("56912345678"), "912345678");
  assert.equal(digitosDeTelefono("(2) 2345 6789"), "223456789");
  assert.equal(digitosDeTelefono("9-1234-5678"), "912345678");
});

test("muestra el teléfono con espacios", () => {
  assert.equal(formatearTelefono("+56912345678"), "+56 9 1234 5678");
  assert.equal(formatearTelefono("+56223456789"), "+56 2 2345 6789");
});

test("acepta los ejemplos válidos y guarda los datos normalizados", () => {
  const resultado = validarConductor({ ...valido, nombre: "  Juan   Pérez " });
  assert.ok(resultado.ok);
  assert.deepEqual(resultado.datos, {
    nombre: "Juan Pérez",
    rut: "22222222-2",
    telefono: "+56912345678",
    email: null,
  });

  for (const [rut, guardado] of [
    ["1000005k", "1000005-K"],
    ["1000013-0", "1000013-0"],
    ["11.111.111-1", "11111111-1"],
  ]) {
    const otro = validarConductor({ ...valido, rut });
    assert.ok(otro.ok, rut);
    assert.equal(otro.datos.rut, guardado);
  }

  for (const telefono of ["+56 9 1234 5678", "912345678"]) {
    const otro = validarConductor({ ...valido, telefono });
    assert.ok(otro.ok, telefono);
    assert.equal(otro.datos.telefono, "+56912345678");
  }
  const fijo = validarConductor({ ...valido, telefono: "(2) 2345 6789" });
  assert.ok(fijo.ok);
  assert.equal(fijo.datos.telefono, "+56223456789");

  const conCorreo = validarConductor({ ...valido, email: " Juan.Perez@Correo.CL " });
  assert.ok(conCorreo.ok);
  assert.equal(conCorreo.datos.email, "juan.perez@correo.cl");

  const sinCorreo = validarConductor({ ...valido, email: undefined });
  assert.ok(sinCorreo.ok);
  assert.equal(sinCorreo.datos.email, null);
});

test("rechaza nombres vacíos o muy cortos", () => {
  assert.equal(errores({ nombre: "" }).nombre, "Ingresa el nombre del conductor.");
  assert.equal(errores({ nombre: "   " }).nombre, "Ingresa el nombre del conductor.");
  assert.equal(errores({ nombre: "J" }).nombre, "El nombre debe tener entre 2 y 100 caracteres.");
  assert.equal(
    errores({ nombre: "a".repeat(101) }).nombre,
    "El nombre debe tener entre 2 y 100 caracteres.",
  );
});

test("rechaza RUT vacíos, con formato inválido o con dígito verificador incorrecto", () => {
  assert.equal(errores({ rut: "" }).rut, "Ingresa el RUT del conductor.");
  assert.equal(errores({ rut: undefined }).rut, "Ingresa el RUT del conductor.");
  for (const rut of ["123456-7", "123456789-0", "11111111-X", "abc"]) {
    assert.equal(errores({ rut }).rut, "El RUT debe tener el formato 12345678-9.", rut);
  }
  assert.equal(
    errores({ rut: "11111111-2" }).rut,
    "El RUT no es válido. Revisa el dígito verificador.",
  );
});

test("rechaza teléfonos vacíos o que no tienen 9 dígitos", () => {
  assert.equal(errores({ telefono: "" }).telefono, "Ingresa el teléfono del conductor.");
  for (const telefono of ["1234", "+56 9 1234 56789", "9 1234 567a"]) {
    assert.equal(
      errores({ telefono }).telefono,
      "El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.",
      telefono,
    );
  }
});

test("rechaza un correo inválido", () => {
  assert.equal(errores({ email: "juan@" }).email, "Ingresa un correo válido o deja el campo vacío.");
});

test("ignora empresa_id y activo enviados en el formulario", () => {
  const resultado = validarConductor({
    ...valido,
    empresaId: "b0000000-0000-4000-8000-000000000002",
    activo: "false",
  });
  assert.ok(resultado.ok);
  assert.equal("empresaId" in resultado.datos, false);
  assert.equal("activo" in resultado.datos, false);
});

test("la búsqueda por RUT parcial no inventa un guion (JOA-09, criterio 6)", async () => {
  const { filtroConductores } = await import("../src/lib/conductores-filtros.ts");
  const condiciones = (buscar: string) => filtroConductores("empresa", { buscar }).OR ?? [];

  // "12345678" es parte de un RUT: no debe buscar también el 1234567-8.
  assert.deepEqual(condiciones("12345678"), [
    { nombre: { contains: "12345678", mode: "insensitive" } },
    { rut: { contains: "12345678" } },
  ]);
  // Un RUT completo sin guion sí agrega la búsqueda exacta.
  assert.deepEqual(condiciones("111111111").at(-1), { rut: "11111111-1" });
  // Siempre filtra por la empresa y, por defecto, solo activos.
  assert.equal(filtroConductores("empresa").empresaId, "empresa");
  assert.equal(filtroConductores("empresa").activo, true);
  assert.equal(filtroConductores("empresa", { incluirInactivos: true }).activo, undefined);
});
