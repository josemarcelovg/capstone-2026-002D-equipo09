// A qué listado vuelve la página "No encontrado", según la sección donde estaba el usuario.

const SECCIONES = [
  { ruta: "/documentos", texto: "Volver al listado de documentos" },
  { ruta: "/conductores", texto: "Volver al listado de conductores" },
] as const;

const INICIO = { href: "/vehiculos", texto: "Volver al listado de vehículos" };

export function listadoParaVolver(ruta: string | null) {
  const seccion = SECCIONES.find(
    ({ ruta: base }) => ruta === base || ruta?.startsWith(`${base}/`),
  );
  return seccion ? { href: seccion.ruta, texto: seccion.texto } : INICIO;
}
