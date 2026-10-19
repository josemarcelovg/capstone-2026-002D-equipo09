import assert from "node:assert/strict";
import { test } from "node:test";
import {
  debeRedirigirAlLogin,
  mensajeDeErrorDeAcceso,
  modoDeAcceso,
  validarCredenciales,
} from "../src/lib/acceso.ts";

// Casos tomados de JOA-01 (secciones 2.4 y 7), JOA-05 (RNF-SEG-01 a RNF-SEG-05) y SIM-02.

const EMPRESA_A = "a0000000-0000-4000-8000-000000000001";
const URL_SUPABASE = "https://proyecto.supabase.co";
const CLAVE_SUPABASE = "clave-publica";
const CREDENCIALES_INCORRECTAS = "Correo o contraseña incorrectos.";

test("acepta credenciales válidas y normaliza el correo", () => {
  const resultado = validarCredenciales({ correo: "  Admin.A@Ejemplo.CL ", contrasena: " clave segura " });
  assert.ok(resultado.ok);
  assert.equal(resultado.datos.correo, "admin.a@ejemplo.cl");
  // La contraseña se envía tal cual: los espacios pueden ser parte de ella.
  assert.equal(resultado.datos.contrasena, " clave segura ");
});

test("pide el correo y la contraseña cuando faltan", () => {
  const resultado = validarCredenciales({ correo: "  ", contrasena: "" });
  assert.equal(resultado.ok, false);
  assert.ok(!resultado.ok && resultado.errores.correo);
  assert.ok(!resultado.ok && resultado.errores.contrasena);
});

test("rechaza un correo con formato inválido", () => {
  const resultado = validarCredenciales({ correo: "admin@", contrasena: "clave" });
  assert.equal(resultado.ok, false);
  assert.ok(!resultado.ok && resultado.errores.correo);
  assert.equal(!resultado.ok && resultado.errores.contrasena, undefined);
});

test("usa el mismo mensaje si el correo no existe, la contraseña es incorrecta o falta confirmar", () => {
  assert.equal(
    mensajeDeErrorDeAcceso({ status: 400, code: "invalid_credentials" }),
    CREDENCIALES_INCORRECTAS,
  );
  assert.equal(
    mensajeDeErrorDeAcceso({ status: 400, code: "email_not_confirmed" }),
    CREDENCIALES_INCORRECTAS,
  );
});

test("avisa cuando hay demasiados intentos sin revelar si la cuenta existe", () => {
  const mensaje = mensajeDeErrorDeAcceso({ status: 429, code: "over_request_rate_limit" });
  assert.notEqual(mensaje, CREDENCIALES_INCORRECTAS);
  assert.match(mensaje, /intentos/);
});

test("no muestra detalles técnicos cuando falla el servicio", () => {
  const caida = mensajeDeErrorDeAcceso({
    status: 500,
    code: "unexpected_failure",
    message: "Database error querying schema",
  });
  const sinConexion = mensajeDeErrorDeAcceso({ message: "fetch failed" });
  assert.equal(caida, sinConexion);
  assert.notEqual(caida, CREDENCIALES_INCORRECTAS);
  assert.doesNotMatch(caida, /database|schema|fetch/i);
});

test("usa Supabase Auth cuando están la dirección y la clave, también en desarrollo", () => {
  for (const produccion of [true, false]) {
    const acceso = modoDeAcceso({
      url: URL_SUPABASE,
      clave: CLAVE_SUPABASE,
      empresaDesarrollo: EMPRESA_A,
      produccion,
    });
    assert.equal(acceso.modo, "supabase");
  }
});

test("en producción nunca usa la empresa de desarrollo", () => {
  const acceso = modoDeAcceso({ url: "", clave: "", empresaDesarrollo: EMPRESA_A, produccion: true });
  assert.equal(acceso.modo, "sin-configurar");
});

test("en desarrollo sin claves de Supabase usa la empresa de desarrollo", () => {
  // Así queda el .env copiado de .env.example y el entorno de Docker (JOS-05).
  const acceso = modoDeAcceso({ url: "", clave: "", empresaDesarrollo: EMPRESA_A, produccion: false });
  assert.deepEqual(acceso, { modo: "desarrollo", empresaId: EMPRESA_A });
});

test("en desarrollo falla si la empresa de desarrollo no es un UUID", () => {
  for (const empresaDesarrollo of [undefined, "", "empresa-a"]) {
    const acceso = modoDeAcceso({ url: "", clave: "", empresaDesarrollo, produccion: false });
    assert.equal(acceso.modo, "sin-configurar");
  }
});

test("falla si Supabase está configurado a medias, en vez de saltarse el inicio de sesión", () => {
  const soloDireccion = modoDeAcceso({
    url: URL_SUPABASE,
    clave: "",
    empresaDesarrollo: EMPRESA_A,
    produccion: false,
  });
  const soloClave = modoDeAcceso({
    url: undefined,
    clave: CLAVE_SUPABASE,
    empresaDesarrollo: EMPRESA_A,
    produccion: false,
  });
  assert.equal(soloDireccion.modo, "sin-configurar");
  assert.equal(soloClave.modo, "sin-configurar");
});

test("sin sesión, cualquier página privada redirige al login", () => {
  for (const ruta of ["/", "/vehiculos", "/vehiculos/nuevo", "/vehiculos/a1000000-0000-4000-8000-000000000001"]) {
    assert.equal(debeRedirigirAlLogin({ ruta, conSesion: false, esAccion: false }), true, ruta);
  }
});

test("la pantalla de login no redirige, pero una ruta parecida sí", () => {
  assert.equal(debeRedirigirAlLogin({ ruta: "/login", conSesion: false, esAccion: false }), false);
  assert.equal(debeRedirigirAlLogin({ ruta: "/login-falso", conSesion: false, esAccion: false }), true);
});

test("con sesión no redirige", () => {
  assert.equal(debeRedirigirAlLogin({ ruta: "/vehiculos", conSesion: true, esAccion: false }), false);
});

test("deja pasar las acciones del servidor, que comprueban la sesión por su cuenta", () => {
  assert.equal(debeRedirigirAlLogin({ ruta: "/vehiculos/nuevo", conSesion: false, esAccion: true }), false);
});
