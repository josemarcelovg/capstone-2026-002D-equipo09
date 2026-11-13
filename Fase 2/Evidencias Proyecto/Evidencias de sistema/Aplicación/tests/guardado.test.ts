import assert from "node:assert/strict";
import { test } from "node:test";
import { llamarAlServidor, SIN_CONEXION } from "../src/lib/guardado.ts";

// ERR-02 (SIM-13): si la solicitud de guardar falla, el formulario muestra un aviso y conserva
// lo escrito, en vez de cambiar a la pantalla de error.

const nada = () => {};

type Errores = { patente?: string; general?: string };

test("devuelve lo que responde el servidor", async () => {
  assert.deepEqual(
    await llamarAlServidor<Errores>(async () => ({ patente: "Patente repetida" }), { general: SIN_CONEXION }, nada),
    { patente: "Patente repetida" },
  );
  assert.equal(await llamarAlServidor(async () => undefined, "aviso", nada), undefined);
});

test("si la solicitud no llega al servidor, devuelve el aviso en vez de lanzar el error", async () => {
  const sinRed = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.deepEqual(await llamarAlServidor<Errores>(sinRed, { general: SIN_CONEXION }, nada), {
    general: SIN_CONEXION,
  });
  assert.equal(await llamarAlServidor(sinRed, SIN_CONEXION, nada), SIN_CONEXION);
});

test("deja pasar las redirecciones de Next.js, que no son errores", async () => {
  const redireccion = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/vehiculos;307;" });
  const relanzar = (error: unknown) => {
    if (error instanceof Error && "digest" in error) throw error;
  };
  await assert.rejects(
    llamarAlServidor(async () => {
      throw redireccion;
    }, SIN_CONEXION, relanzar),
    redireccion,
  );
});

test("el aviso dice que no se guardó y qué hacer", () => {
  assert.equal(SIN_CONEXION, "No pudimos guardar. Revisa tu conexión e intenta nuevamente.");
});
