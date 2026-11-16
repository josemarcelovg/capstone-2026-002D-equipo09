// Encabezados de seguridad que se agregan a todas las respuestas (ver next.config.ts).

export type Encabezado = { key: string; value: string };

export const POLITICA_DE_CONTENIDO = [
  // Ningún otro sitio puede mostrar la app dentro de un iframe.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export const ENCABEZADOS_DE_SEGURIDAD: Encabezado[] = [
  { key: "Content-Security-Policy", value: POLITICA_DE_CONTENIDO },
  // Lo mismo, para navegadores antiguos.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Obliga a usar HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
