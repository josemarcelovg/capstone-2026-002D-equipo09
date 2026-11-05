import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";
import { ENCABEZADOS_DE_SEGURIDAD, POLITICA_DE_CONTENIDO } from "../src/lib/seguridad.ts";

// Encabezados HTTP de seguridad (src/lib/seguridad.ts), SIM-04 CP-SEG-14.

const valor = (nombre: string) => ENCABEZADOS_DE_SEGURIDAD.find(({ key }) => key === nombre)?.value;

test("ningún otro sitio puede mostrar la aplicación dentro de un iframe", () => {
  assert.match(POLITICA_DE_CONTENIDO, /(^|; )frame-ancestors 'none'(;|$)/);
  assert.equal(valor("X-Frame-Options"), "DENY");
});

test("los formularios y la dirección base solo pueden apuntar a la propia aplicación", () => {
  assert.match(POLITICA_DE_CONTENIDO, /(^|; )form-action 'self'(;|$)/);
  assert.match(POLITICA_DE_CONTENIDO, /(^|; )base-uri 'self'(;|$)/);
  assert.match(POLITICA_DE_CONTENIDO, /(^|; )object-src 'none'(;|$)/);
});

test("el navegador no adivina tipos de archivo ni envía la dirección completa a otros sitios", () => {
  assert.equal(valor("X-Content-Type-Options"), "nosniff");
  assert.equal(valor("Referrer-Policy"), "strict-origin-when-cross-origin");
});

test("bloquea cámara, micrófono y ubicación", () => {
  const permisos = valor("Permissions-Policy") ?? "";
  for (const permiso of ["camera", "microphone", "geolocation"]) {
    assert.match(permisos, new RegExp(`(^|, )${permiso}=\\(\\)(,|$)`), permiso);
  }
});

test("exige HTTPS durante al menos un año", () => {
  const segundos = Number(/max-age=(\d+)/.exec(valor("Strict-Transport-Security") ?? "")?.[1]);
  assert.ok(segundos >= 31_536_000, `max-age=${segundos}`);
});

test("cada encabezado aparece una sola vez", () => {
  const nombres = ENCABEZADOS_DE_SEGURIDAD.map(({ key }) => key.toLowerCase());
  assert.equal(new Set(nombres).size, nombres.length);
});

test("next.config los aplica a todas las rutas y no anuncia Next.js", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  assert.ok(nextConfig.headers, "next.config no define headers()");
  assert.deepEqual(await nextConfig.headers(), [
    { source: "/:path*", headers: ENCABEZADOS_DE_SEGURIDAD },
  ]);
});
