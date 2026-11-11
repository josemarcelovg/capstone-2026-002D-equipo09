// A qué listado vuelve la página "No encontrado", según la sección donde se estaba (SIM-08 y
// SIM-12, observaciones de esa página). Sin dependencias de Next.js para poder probarla
// directamente (tests/navegacion.test.ts).

const SECCIONES = [
  { ruta: "/documentos", texto: "Volver al listado de documentos" },
  { ruta: "/conductores", texto: "Volver al listado de conductores" },
] as const;

/** El inicio de la aplicación es el listado de vehículos (src/app/page.tsx). */
const INICIO = { href: "/vehiculos", texto: "Volver al listado de vehículos" };

/** El listado de la sección de `ruta`, o el de vehículos si la ruta no es de otra sección. */
export function listadoParaVolver(ruta: string | null) {
  const seccion = SECCIONES.find(
    ({ ruta: base }) => ruta === base || ruta?.startsWith(`${base}/`),
  );
  return seccion ? { href: seccion.ruta, texto: seccion.texto } : INICIO;
}
