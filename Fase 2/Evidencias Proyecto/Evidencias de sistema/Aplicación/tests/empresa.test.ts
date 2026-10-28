import assert from "node:assert/strict";
import { test } from "node:test";
import { cambiaElCorreo, validarEmpresa } from "../src/lib/empresa.ts";

// Datos de contacto de la empresa (PB-14). Solo datos ficticios.

const valido = {
  nombre: "Transportes Cordillera (ficticia)",
  emailContacto: "contacto@cordillera.example",
  telefono: "",
  rut: "",
};

function errores(cambios: Record<string, unknown>, rutGuardado: string | null = null) {
  const resultado = validarEmpresa({ ...valido, ...cambios }, rutGuardado);
  return resultado.ok ? {} : resultado.errores;
}

test("acepta los datos mínimos y deja vacíos el teléfono y el RUT", () => {
  const resultado = validarEmpresa(valido);
  assert.ok(resultado.ok);
  assert.deepEqual(resultado.datos, {
    nombre: "Transportes Cordillera (ficticia)",
    emailContacto: "contacto@cordillera.example",
    telefono: null,
    rut: null,
  });
  const sinCampos = validarEmpresa({ nombre: valido.nombre, emailContacto: valido.emailContacto });
  assert.ok(sinCampos.ok);
  assert.equal(sinCampos.datos.telefono, null);
});

test("normaliza el nombre, el correo, el teléfono y el RUT", () => {
  const resultado = validarEmpresa({
    nombre: "  Buses   del Litoral ",
    emailContacto: " Contacto@Litoral.EXAMPLE ",
    telefono: "+56 2 2345 6789",
    rut: "11.111.111-1",
  });
  assert.ok(resultado.ok);
  assert.equal(resultado.datos.nombre, "Buses del Litoral");
  assert.equal(resultado.datos.emailContacto, "contacto@litoral.example");
  assert.equal(resultado.datos.telefono, "+56223456789");
  assert.equal(resultado.datos.rut, "11111111-1");
});

test("el nombre y el correo son obligatorios", () => {
  assert.equal(errores({ nombre: "" }).nombre, "Ingresa el nombre de la empresa.");
  assert.equal(errores({ nombre: "A" }).nombre, "El nombre debe tener entre 2 y 100 caracteres.");
  assert.equal(errores({ emailContacto: "" }).emailContacto, "Ingresa un correo válido.");
  assert.equal(errores({ emailContacto: "contacto@" }).emailContacto, "Ingresa un correo válido.");
});

test("rechaza un teléfono o un RUT inválidos", () => {
  assert.equal(
    errores({ telefono: "1234" }).telefono,
    "El teléfono debe tener 9 dígitos, por ejemplo 9 1234 5678.",
  );
  assert.equal(errores({ rut: "abc" }).rut, "El RUT debe tener el formato 12345678-9.");
  assert.equal(
    errores({ rut: "11111111-2" }).rut,
    "El RUT no es válido. Revisa el dígito verificador.",
  );
});

test("si la empresa ya tiene RUT, se conserva aunque el formulario mande otro", () => {
  const resultado = validarEmpresa({ ...valido, rut: "22.222.222-2" }, "11111111-1");
  assert.ok(resultado.ok);
  assert.equal(resultado.datos.rut, "11111111-1");

  const sinRut = validarEmpresa({ ...valido, rut: "" }, "11111111-1");
  assert.ok(sinRut.ok);
  assert.equal(sinRut.datos.rut, "11111111-1");
});

test("ignora campos que no son de la empresa", () => {
  const resultado = validarEmpresa({ ...valido, id: "b0000000-0000-4000-8000-000000000002" });
  assert.ok(resultado.ok);
  assert.equal("id" in resultado.datos, false);
});

test("detecta cuándo cambia el correo de contacto", () => {
  assert.equal(cambiaElCorreo("contacto@a.example", " Contacto@A.example "), false);
  assert.equal(cambiaElCorreo("contacto@a.example", "otro@a.example"), true);
});
