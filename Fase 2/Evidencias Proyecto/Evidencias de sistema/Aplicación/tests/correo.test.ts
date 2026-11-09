import assert from "node:assert/strict";
import { test } from "node:test";
import { enviadorResend, REMITENTE_DE_PRUEBA, type MensajeCorreo } from "../src/lib/correo.ts";

// El envío con Resend se prueba sin llamar a Resend: una función reemplaza a fetch y guarda
// lo que se habría enviado. La clave es inventada.

const MENSAJE: MensajeCorreo = {
  para: "contacto@cordillera.example",
  asunto: "MicroLogist: 1 documento por vencer",
  texto: "Hola, Transportes Cordillera:",
  html: "<p>Hola, Transportes Cordillera:</p>",
};

function fetchFalso(estado = 200) {
  const llamadas: { url: string; opciones: RequestInit }[] = [];
  const hacer = (async (url: string | URL | Request, opciones?: RequestInit) => {
    llamadas.push({ url: String(url), opciones: opciones ?? {} });
    return new Response(JSON.stringify({ id: "correo-de-prueba" }), { status: estado });
  }) as typeof fetch;
  return { hacer, llamadas };
}

test("envía el correo a la API de Resend con la clave, el remitente y los dos formatos", async () => {
  const { hacer, llamadas } = fetchFalso();
  const enviar = enviadorResend({ clave: "re_clave_inventada", remitente: "MicroLogist <avisos@micrologist.example>" }, hacer);
  await enviar(MENSAJE);

  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, "https://api.resend.com/emails");
  assert.equal(llamadas[0].opciones.method, "POST");
  const encabezados = llamadas[0].opciones.headers as Record<string, string>;
  assert.equal(encabezados.Authorization, "Bearer re_clave_inventada");
  assert.deepEqual(JSON.parse(String(llamadas[0].opciones.body)), {
    from: "MicroLogist <avisos@micrologist.example>",
    to: ["contacto@cordillera.example"],
    subject: MENSAJE.asunto,
    text: MENSAJE.texto,
    html: MENSAJE.html,
  });
});

test("sin remitente configurado usa el remitente de prueba de Resend", async () => {
  const { hacer, llamadas } = fetchFalso();
  await enviadorResend({ clave: "re_clave_inventada", remitente: " " }, hacer)(MENSAJE);
  assert.equal(JSON.parse(String(llamadas[0].opciones.body)).from, REMITENTE_DE_PRUEBA);
});

test("sin RESEND_API_KEY falla sin llamar a Resend, para que el aviso quede como fallido", async () => {
  const { hacer, llamadas } = fetchFalso();
  for (const clave of [undefined, "", "  "]) {
    await assert.rejects(enviadorResend({ clave }, hacer)(MENSAJE), /RESEND_API_KEY/);
  }
  assert.equal(llamadas.length, 0);
});

test("si Resend rechaza el correo, falla con el código y sin el detalle de la respuesta", async () => {
  const { hacer } = fetchFalso(422);
  await assert.rejects(enviadorResend({ clave: "re_clave_inventada" }, hacer)(MENSAJE), (error: Error) => {
    assert.match(error.message, /HTTP 422/);
    assert.doesNotMatch(error.message, /cordillera/);
    return true;
  });
});
