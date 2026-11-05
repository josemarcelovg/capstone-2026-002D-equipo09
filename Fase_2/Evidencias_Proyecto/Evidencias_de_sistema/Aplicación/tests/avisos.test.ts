import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agruparPorEmpresa,
  armarCorreo,
  asuntoDelCorreo,
  avisosPendientes,
  esLlamadaAutorizada,
  plazoQueCorresponde,
  type AvisoRegistrado,
  type DocumentoParaAviso,
} from "../src/lib/avisos.ts";

// Casos tomados de JOA-13 (secciones 3, 4 y 6). Hoy es 01-12-2026 en hora de Chile, como en su
// ejemplo. Los nombres, patentes y empresas son ficticios.

const HOY = "2026-12-01";
const EMPRESA_A = "a0000000-0000-4000-8000-000000000001";
const EMPRESA_B = "b0000000-0000-4000-8000-000000000002";
const URL_DOCUMENTOS = "https://micrologist.example/documentos";

let siguienteId = 0;
function documento(cambios: Partial<DocumentoParaAviso> = {}): DocumentoParaAviso {
  siguienteId++;
  return {
    id: `d0000000-0000-4000-8000-${String(siguienteId).padStart(12, "0")}`,
    empresaId: EMPRESA_A,
    tipo: "revision_tecnica",
    descripcion: null,
    fechaVencimiento: "2026-12-08",
    dueno: "BBCD-12",
    duenoActivo: true,
    ...cambios,
  };
}

const enviado = (doc: DocumentoParaAviso, diasAnticipacion: number, estado: AvisoRegistrado["estado"] = "enviado") => ({
  documentoId: doc.id,
  fechaVencimiento: doc.fechaVencimiento,
  diasAnticipacion,
  estado,
});

test("elige el plazo que corresponde a los días que faltan (tabla de JOA-13, sección 3.1)", () => {
  const casos: [number, number | null][] = [
    [45, null],
    [31, null],
    [30, 30],
    [8, 30],
    [7, 7],
    [5, 7],
    [2, 7],
    [1, 1],
    [0, 0],
    [-1, null],
  ];
  for (const [dias, plazo] of casos) {
    assert.equal(plazoQueCorresponde(dias), plazo, `${dias} días`);
  }
});

test("criterios 1 y 2: avisa a los 30, 7 y 1 días y el mismo día, pero no a los 31 ni vencido", () => {
  const documentos = [
    documento({ fechaVencimiento: "2026-12-31" }),
    documento({ fechaVencimiento: "2026-12-08" }),
    documento({ fechaVencimiento: "2026-12-02" }),
    documento({ fechaVencimiento: "2026-12-01" }),
    documento({ fechaVencimiento: "2027-01-01" }),
    documento({ fechaVencimiento: "2026-11-30" }),
  ];
  const pendientes = avisosPendientes(documentos, [], HOY);
  assert.deepEqual(
    pendientes.map(({ documento: d, plazo, dias }) => [d.fechaVencimiento, plazo, dias]),
    [
      ["2026-12-01", 0, 0],
      ["2026-12-02", 1, 1],
      ["2026-12-08", 7, 7],
      ["2026-12-31", 30, 30],
    ],
  );
});

test("criterio 3: a los 5 días manda una vez el de 7, sin el de 30 atrasado", () => {
  const doc = documento({ fechaVencimiento: "2026-12-06" });
  const pendientes = avisosPendientes([doc], [], HOY);
  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0].plazo, 7);
  assert.equal(pendientes[0].dias, 5);
  const { texto } = armarCorreo({ nombre: "Transportes Cordillera" }, pendientes, HOY, URL_DOCUMENTOS);
  assert.match(texto, /Vence en 5 días/);
});

test("criterio 6: los documentos de dueños inactivos no se avisan", () => {
  const pendientes = avisosPendientes([documento({ duenoActivo: false })], [], HOY);
  assert.deepEqual(pendientes, []);
});

test("criterio 9: un aviso ya enviado no se repite, aunque el proceso corra de nuevo", () => {
  const doc = documento({ fechaVencimiento: "2026-12-08" });
  assert.equal(avisosPendientes([doc], [], HOY).length, 1);
  assert.deepEqual(avisosPendientes([doc], [enviado(doc, 7)], HOY), []);
});

test("criterio 10: un aviso fallido se vuelve a incluir", () => {
  const doc = documento({ fechaVencimiento: "2026-12-08" });
  const pendientes = avisosPendientes([doc], [enviado(doc, 7, "fallido")], HOY);
  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0].plazo, 7);
});

test("si el plazo de un aviso fallido ya pasó, se manda el de hoy", () => {
  // Falló el de 7 días; hoy falta 1 día, así que toca el de 1.
  const doc = documento({ fechaVencimiento: "2026-12-02" });
  const pendientes = avisosPendientes([doc], [enviado(doc, 7, "fallido")], HOY);
  assert.deepEqual(
    pendientes.map(({ plazo }) => plazo),
    [1],
  );
});

test("los avisos ya enviados de otros plazos no impiden el de hoy", () => {
  const doc = documento({ fechaVencimiento: "2026-12-08" });
  const pendientes = avisosPendientes([doc], [enviado(doc, 30)], HOY);
  assert.deepEqual(
    pendientes.map(({ plazo }) => plazo),
    [7],
  );
});

test("criterio 11: un documento renovado vuelve a recibir sus avisos", () => {
  const antes = documento({ fechaVencimiento: "2026-11-24" });
  const renovado = { ...antes, fechaVencimiento: "2026-12-31" };
  // Con la fecha anterior ya se habían enviado los avisos de 30, 7, 1 y 0 días.
  const registrados = [30, 7, 1, 0].map((plazo) => enviado(antes, plazo));
  const pendientes = avisosPendientes([renovado], registrados, HOY);
  assert.deepEqual(
    pendientes.map(({ plazo }) => plazo),
    [30],
  );
});

test("criterios 4 y 7: un grupo por empresa, sin mezclar sus documentos", () => {
  const deA = [documento({ fechaVencimiento: "2026-12-08" }), documento({ fechaVencimiento: "2026-12-01" })];
  const deB = [documento({ empresaId: EMPRESA_B, fechaVencimiento: "2026-12-02" })];
  const grupos = agruparPorEmpresa(avisosPendientes([...deA, ...deB], [], HOY));
  assert.deepEqual([...grupos.keys()].sort(), [EMPRESA_A, EMPRESA_B]);
  assert.equal(grupos.get(EMPRESA_A)?.length, 2);
  assert.ok(grupos.get(EMPRESA_A)?.every(({ documento: d }) => d.empresaId === EMPRESA_A));
  assert.deepEqual(
    grupos.get(EMPRESA_B)?.map(({ documento: d }) => d.id),
    deB.map((d) => d.id),
  );
});

test("criterio 5: sin documentos con aviso no hay grupos, así que no se envía correo", () => {
  const grupos = agruparPorEmpresa(avisosPendientes([documento({ fechaVencimiento: "2027-03-01" })], [], HOY));
  assert.equal(grupos.size, 0);
});

test("arma el correo del ejemplo de JOA-13 (sección 4)", () => {
  const documentos = [
    documento({ tipo: "revision_tecnica", dueno: "FGHJ-34", fechaVencimiento: "2026-12-31" }),
    documento({ tipo: "permiso_circulacion", dueno: "BBCD-12", fechaVencimiento: "2026-12-08" }),
    documento({ tipo: "licencia_conducir", dueno: "Pedro Soto", fechaVencimiento: "2026-12-01" }),
  ];
  const correo = armarCorreo(
    { nombre: "Transportes Cordillera" },
    avisosPendientes(documentos, [], HOY),
    HOY,
    URL_DOCUMENTOS,
  );
  assert.equal(correo.asunto, "MicroLogist: documentos que vencen hoy");
  assert.equal(
    correo.texto,
    [
      "Hola, Transportes Cordillera:",
      "",
      "Estos documentos necesitan tu atención:",
      "",
      "- Licencia de conducir · Pedro Soto · vence el 01-12-2026 · Vence hoy",
      "- Permiso de circulación · BBCD-12 · vence el 08-12-2026 · Vence en 7 días",
      "- Revisión técnica · FGHJ-34 · vence el 31-12-2026 · Vence en 30 días",
      "",
      `Ver documentos: ${URL_DOCUMENTOS}`,
      "",
      "Este aviso se envía al correo de contacto de tu empresa. Puedes cambiarlo en los datos de tu empresa.",
    ].join("\n"),
  );
  assert.match(correo.html, /<strong>Licencia de conducir<\/strong> · Pedro Soto · vence el 01-12-2026 · <strong>Vence hoy<\/strong>/);
  assert.match(correo.html, new RegExp(`<a href="${URL_DOCUMENTOS}">Ver documentos</a>`));
  assert.doesNotMatch(correo.html, /<img/);
});

test("el asunto dice cuántos documentos hay, en singular o plural", () => {
  const avisos = (...fechas: string[]) =>
    avisosPendientes(
      fechas.map((fechaVencimiento) => documento({ fechaVencimiento })),
      [],
      HOY,
    );
  assert.equal(asuntoDelCorreo(avisos("2026-12-08", "2026-12-31", "2026-12-02")), "MicroLogist: 3 documentos por vencer");
  assert.equal(asuntoDelCorreo(avisos("2026-12-08")), "MicroLogist: 1 documento por vencer");
  assert.equal(asuntoDelCorreo(avisos("2026-12-01")), "MicroLogist: un documento vence hoy");
});

test("dice «Vence mañana» cuando falta un día", () => {
  const correo = armarCorreo(
    { nombre: "Buses del Litoral" },
    avisosPendientes([documento({ fechaVencimiento: "2026-12-02" })], [], HOY),
    HOY,
    URL_DOCUMENTOS,
  );
  assert.match(correo.texto, /vence el 02-12-2026 · Vence mañana/);
});

test("un documento de tipo «otro» se nombra con su descripción", () => {
  const correo = armarCorreo(
    { nombre: "Transportes Cordillera" },
    avisosPendientes([documento({ tipo: "otro", descripcion: "Seguro de pasajeros" })], [], HOY),
    HOY,
    URL_DOCUMENTOS,
  );
  assert.match(correo.texto, /- Seguro de pasajeros · BBCD-12/);
});

test("quita los espacios sobrantes del nombre de la empresa", () => {
  const correo = armarCorreo({ nombre: "  Transportes Cordillera " }, avisosPendientes([documento()], [], HOY), HOY, URL_DOCUMENTOS);
  assert.match(correo.texto, /^Hola, Transportes Cordillera:\n/);
});

test("los datos escritos por los usuarios no se interpretan como HTML", () => {
  const correo = armarCorreo(
    { nombre: "Fletes & Buses <b>" },
    avisosPendientes([documento({ tipo: "licencia_conducir", dueno: '<script>alert("x")</script>' })], [], HOY),
    HOY,
    URL_DOCUMENTOS,
  );
  assert.match(correo.html, /Hola, Fletes &amp; Buses &lt;b&gt;:/);
  assert.match(correo.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(correo.html, /<script>/);
  // El texto simple no es HTML: queda tal cual.
  assert.match(correo.texto, /<script>alert\("x"\)<\/script>/);
});

test("criterio 12: la ruta solo se autoriza con la clave de CRON_SECRET", () => {
  const secreto = "una-clave-larga-y-aleatoria";
  assert.equal(esLlamadaAutorizada(`Bearer ${secreto}`, secreto), true);
  assert.equal(esLlamadaAutorizada(`Bearer ${secreto}x`, secreto), false);
  assert.equal(esLlamadaAutorizada("Bearer otra-clave-del-mismo-largo", secreto), false);
  assert.equal(esLlamadaAutorizada(secreto, secreto), false);
  assert.equal(esLlamadaAutorizada(null, secreto), false);
});

test("sin CRON_SECRET configurado la ruta nunca se autoriza", () => {
  for (const secreto of [undefined, "", "   "]) {
    assert.equal(esLlamadaAutorizada("Bearer ", secreto), false);
    assert.equal(esLlamadaAutorizada("Bearer undefined", secreto), false);
  }
});
