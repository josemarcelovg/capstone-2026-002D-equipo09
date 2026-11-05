// Encabezados HTTP de seguridad que se agregan a todas las respuestas (next.config.ts).
// No reemplazan los controles del servidor (SIM-02): le indican al navegador qué no debe
// permitir con nuestras páginas. La política de contenido (CSP) se limita a lo que no
// interfiere con los scripts de Next.js; una política con nonce queda pendiente (SIM-04).

export type Encabezado = { key: string; value: string };

export const POLITICA_DE_CONTENIDO = [
  // Ningún otro sitio puede mostrar la aplicación dentro de un iframe (clickjacking).
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // Los formularios solo se envían a la propia aplicación.
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export const ENCABEZADOS_DE_SEGURIDAD: Encabezado[] = [
  { key: "Content-Security-Policy", value: POLITICA_DE_CONTENIDO },
  // Lo mismo que frame-ancestors, para navegadores antiguos.
  { key: "X-Frame-Options", value: "DENY" },
  // Que el navegador no adivine el tipo de un archivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // A otros sitios solo se les informa el dominio, nunca la dirección completa (lleva ids).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La aplicación no usa cámara, micrófono, ubicación ni pagos.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Después de entrar por HTTPS, el navegador no vuelve a usar HTTP (RNF-SEG-08).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
