import {
  normalizarPatente,
  type DatosVehiculo,
  type Estado,
  type Vehiculo,
} from "@/lib/vehiculos";

// Acceso a datos de vehículos. Por ahora son datos de ejemplo en memoria:
// se pierden al reiniciar el servidor y no distinguen entre empresas.
// JOS-03 reemplaza el contenido de estas funciones por consultas con Prisma,
// filtradas siempre por el empresa_id de la sesión (JOA-01, sección 2.4).
// Las pantallas solo usan estas funciones, así que no deberían cambiar.

const EJEMPLOS: Vehiculo[] = [
  {
    id: "5f0c1a52-8f0e-4f0b-9d4e-2f6a1c7b9e01",
    patente: "BBCD12",
    tipo: "minibus",
    marca: "Yutong",
    modelo: "ZK6729",
    anio: 2018,
    capacidadPasajeros: 25,
    numeroInterno: "12",
    color: "Blanco",
    estado: "activo",
    observaciones: null,
  },
  {
    id: "9b2d7c34-1a6f-4c58-8e21-7d3b5a9c4f02",
    patente: "HJKL78",
    tipo: "bus",
    marca: "Mercedes-Benz",
    modelo: "O500",
    anio: 2016,
    capacidadPasajeros: 45,
    numeroInterno: "7",
    color: null,
    estado: "en_mantencion",
    observaciones: "En taller por cambio de frenos.",
  },
  {
    id: "c41e8f76-3b2a-4d90-a5c7-6e8f2b1d3a03",
    patente: "XY4321",
    tipo: "van",
    marca: "Hyundai",
    modelo: "H350",
    anio: 2009,
    capacidadPasajeros: 15,
    numeroInterno: null,
    color: "Gris",
    estado: "inactivo",
    observaciones: "Vendida.",
  },
];

// Se guarda en globalThis para que la lista sobreviva a las recargas de `next dev`.
const almacen = globalThis as typeof globalThis & { vehiculosDeEjemplo?: Vehiculo[] };
const vehiculos = (almacen.vehiculosDeEjemplo ??= [...EJEMPLOS]);

export type FiltroVehiculos = {
  patente?: string;
  estado?: Estado;
  incluirInactivos?: boolean;
};

/** Ordenados por patente. Sin `estado` no trae los inactivos, salvo que se pidan. */
export async function listarVehiculos({
  patente = "",
  estado,
  incluirInactivos = false,
}: FiltroVehiculos = {}): Promise<Vehiculo[]> {
  const buscada = normalizarPatente(patente);
  return vehiculos
    .filter((vehiculo) => vehiculo.patente.includes(buscada))
    .filter((vehiculo) =>
      estado ? vehiculo.estado === estado : incluirInactivos || vehiculo.estado !== "inactivo",
    )
    .sort((a, b) => a.patente.localeCompare(b.patente));
}

export async function obtenerVehiculo(id: string): Promise<Vehiculo | null> {
  return vehiculos.find((vehiculo) => vehiculo.id === id) ?? null;
}

export async function buscarPorPatente(patente: string): Promise<Vehiculo | null> {
  return vehiculos.find((vehiculo) => vehiculo.patente === patente) ?? null;
}

export async function crearVehiculo(datos: DatosVehiculo): Promise<Vehiculo> {
  const vehiculo = { id: crypto.randomUUID(), ...datos };
  vehiculos.push(vehiculo);
  return vehiculo;
}

/** Devuelve `null` si el vehículo no existe. */
export async function actualizarVehiculo(
  id: string,
  cambios: Partial<DatosVehiculo>,
): Promise<Vehiculo | null> {
  const vehiculo = vehiculos.find((actual) => actual.id === id);
  if (!vehiculo) return null;
  return Object.assign(vehiculo, cambios);
}
