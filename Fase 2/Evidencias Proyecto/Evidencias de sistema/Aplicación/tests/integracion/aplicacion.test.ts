import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, test } from "node:test";
import { ENCABEZADOS_DE_SEGURIDAD } from "../../src/lib/seguridad.ts";

// Pruebas de integración de la aplicación levantada con Supabase Auth (SIM-04, CP-INT-11 a
// CP-INT-16): el proxy, las páginas y Supabase funcionando juntos, como los usa el navegador.
// Solo leen: no inician sesión con cuentas reales ni crean datos.
//
// Necesitan la aplicación corriendo (npm run dev) con el mismo .env. Por defecto se prueba
// http://localhost:3000; otra dirección se indica en URL_APLICACION.

const URL_APLICACION = process.env.URL_APLICACION ?? "http://localhost:3000";
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const CLAVE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Un vehículo del seed de la Empresa A (prisma/seed.ts).
const VEHICULO_DEL_SEED = "a1000000-0000-4000-8000-000000000001";

const sinSupabase =
  URL_SUPABASE && CLAVE_SUPABASE
    ? false
    : "Faltan las variables de Supabase en el .env: la aplicación queda en modo desarrollo, sin inicio de sesión.";

// La primera solicitud a `npm run dev` compila la página, por eso el plazo es largo.
const aplicacionLevantada = await fetch(new URL("/login", URL_APLICACION), {
  signal: AbortSignal.timeout(60_000),
}).then(
  (respuesta) => respuesta.ok,
  () => false,
);
const sinAplicacion = aplicacionLevantada
  ? false
  : `La aplicación no responde en ${URL_APLICACION}. Levántala con npm run dev o indica la dirección en URL_APLICACION.`;

function pedir(ruta: string, encabezados: Record<string, string> = {}) {
  return fetch(new URL(ruta, URL_APLICACION), {
    headers: encabezados,
    redirect: "manual",
    signal: AbortSignal.timeout(60_000),
  });
}

async function comprobarQueVaAlLogin(ruta: string, encabezados?: Record<string, string>) {
  const respuesta = await pedir(ruta, encabezados);
  const destino = new URL(respuesta.headers.get("location") ?? "", URL_APLICACION);
  assert.equal(respuesta.status, 307, `${ruta} respondió ${respuesta.status}`);
  assert.equal(destino.pathname, "/login", `${ruta} redirigió a ${destino.pathname}`);
  assert.doesNotMatch(await respuesta.text(), /BBCD|Transportes Cordillera/, `${ruta} mostró datos`);
}

const base64url = (valor: string) => Buffer.from(valor).toString("base64url");

/** Cookie de sesión con el formato de @supabase/ssr, pero con un token con firma inventada. */
function cookieFalsificada() {
  const ahora = Math.floor(Date.now() / 1000);
  const token = [
    base64url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64url(
      JSON.stringify({
        sub: randomUUID(),
        email: "admin.empresa.a@micrologist.cl",
        role: "authenticated",
        aud: "authenticated",
        iat: ahora,
        exp: ahora + 3600,
      }),
    ),
    base64url("firma-inventada"),
  ].join(".");
  const sesion = {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: ahora + 3600,
    refresh_token: "inventado",
    user: { id: randomUUID(), email: "admin.empresa.a@micrologist.cl" },
  };
  const proyecto = new URL(URL_SUPABASE ?? "http://proyecto").hostname.split(".")[0];
  return `sb-${proyecto}-auth-token=base64-${base64url(JSON.stringify(sesion))}`;
}

describe("Aplicación levantada", { skip: sinAplicacion }, () => {
  test("CP-INT-11 · el inicio de sesión responde con el formulario", async () => {
    const respuesta = await pedir("/login");
    assert.equal(respuesta.status, 200);
    const html = await respuesta.text();
    assert.match(html, /<html lang="es"/);
    assert.match(html, /name="correo"/);
    assert.match(html, /type="password"/);
  });

  test("CP-INT-12 · sin sesión, cada página privada redirige al inicio de sesión", { skip: sinSupabase }, async () => {
    for (const ruta of [
      "/",
      "/vehiculos",
      "/vehiculos?inactivos=1",
      "/vehiculos/nuevo",
      `/vehiculos/${VEHICULO_DEL_SEED}`,
      `/vehiculos/${randomUUID()}`,
    ]) {
      await comprobarQueVaAlLogin(ruta);
    }
  });

  test("CP-INT-13 · una sesión falsificada no da acceso", { skip: sinSupabase }, async () => {
    const encabezados = { cookie: cookieFalsificada() };
    await comprobarQueVaAlLogin("/vehiculos", encabezados);
    await comprobarQueVaAlLogin(`/vehiculos/${VEHICULO_DEL_SEED}`, encabezados);
  });

  test("CP-INT-14 · los archivos públicos se entregan sin pedir sesión", async () => {
    const respuesta = await pedir("/favicon.ico");
    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get("content-type") ?? "", /^image\//);
  });

  test("CP-INT-16 · todas las respuestas llevan los encabezados de seguridad", async () => {
    // Una página, un archivo público y una página privada (sin sesión, la redirección del proxy).
    for (const ruta of ["/login", "/favicon.ico", "/vehiculos"]) {
      const respuesta = await pedir(ruta);
      for (const { key, value } of ENCABEZADOS_DE_SEGURIDAD) {
        assert.equal(respuesta.headers.get(key), value, `${ruta} (${respuesta.status}): ${key}`);
      }
      assert.equal(respuesta.headers.get("x-powered-by"), null, `${ruta} anuncia Next.js`);
    }
  });
});

describe("Supabase", { skip: sinSupabase }, () => {
  test("CP-INT-15 · la clave pública no permite leer las tablas sin pasar por la aplicación", async () => {
    for (const tabla of ["empresa", "usuario", "vehiculo"]) {
      const respuesta = await fetch(`${URL_SUPABASE}/rest/v1/${tabla}?select=*&limit=1`, {
        headers: { apikey: CLAVE_SUPABASE ?? "" },
        signal: AbortSignal.timeout(30_000),
      });
      const cuerpo = await respuesta.json();
      if (respuesta.ok) {
        assert.deepEqual(cuerpo, [], `La API de Supabase devolvió filas de ${tabla}`);
      } else {
        assert.ok([401, 403, 404].includes(respuesta.status), `${tabla}: ${respuesta.status}`);
      }
    }
  });
});
