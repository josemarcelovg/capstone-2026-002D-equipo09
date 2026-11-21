import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client.ts";
import { fechaParaBase, hoyEnChile, sumarDias } from "../src/lib/fechas.ts";

// Datos de prueba: dos empresas inventadas con sus vehículos, conductores y turnos.
// Se puede ejecutar varias veces: solo crea lo que falta y no cambia lo que ya existe.
// Los usuarios no se crean aquí porque su id viene de Supabase Auth.

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

const EMPRESA_A = "a0000000-0000-4000-8000-000000000001";
const EMPRESA_B = "b0000000-0000-4000-8000-000000000002";

type EmpresaSeed = Omit<Prisma.EmpresaCreateInput, "createdAt" | "updatedAt"> & { id: string };

const empresas: EmpresaSeed[] = [
  {
    id: EMPRESA_A,
    nombre: "Transportes Cordillera (ficticia)",
    emailContacto: "contacto@cordillera.example",
  },
  {
    id: EMPRESA_B,
    nombre: "Buses del Litoral (ficticia)",
    emailContacto: "contacto@litoral.example",
  },
];

type VehiculoSeed = Omit<Prisma.VehiculoUncheckedCreateInput, "createdAt" | "updatedAt"> & {
  id: string;
};

const vehiculos: VehiculoSeed[] = [
  // Empresa A
  {
    id: "a1000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_A,
    patente: "BBCD12",
    tipo: "minibus",
    marca: "Yutong",
    modelo: "ZK6729",
    anio: 2018,
    capacidadPasajeros: 25,
    numeroInterno: "12",
    color: "Blanco",
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_A,
    patente: "HJKL78",
    tipo: "bus",
    marca: "Mercedes-Benz",
    modelo: "O500",
    anio: 2016,
    capacidadPasajeros: 45,
    numeroInterno: "7",
    estado: "en_mantencion",
    observaciones: "En taller por cambio de frenos.",
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    empresaId: EMPRESA_A,
    patente: "FGHJ34",
    tipo: "van",
    marca: "Mercedes-Benz",
    modelo: "Sprinter 515",
    anio: 2021,
    capacidadPasajeros: 19,
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    empresaId: EMPRESA_A,
    patente: "XY4321",
    tipo: "van",
    marca: "Hyundai",
    modelo: "H350",
    anio: 2009,
    capacidadPasajeros: 15,
    color: "Gris",
    estado: "inactivo",
    observaciones: "Vendida.",
  },
  // Empresa B: repite la patente BBCD12 a propósito, porque otra empresa sí puede tenerla.
  {
    id: "b1000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_B,
    patente: "BBCD12",
    tipo: "minibus",
    marca: "Yutong",
    modelo: "ZK6729",
    anio: 2018,
    capacidadPasajeros: 25,
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_B,
    patente: "AB1234",
    tipo: "bus",
    marca: "Volvo",
    modelo: "B290R",
    anio: 2012,
    capacidadPasajeros: 44,
    estado: "en_mantencion",
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    empresaId: EMPRESA_B,
    patente: "KLPR56",
    tipo: "furgon",
    marca: "Hyundai",
    modelo: "H-1",
    anio: 2019,
    capacidadPasajeros: 11,
  },
];

type ConductorSeed = Omit<Prisma.ConductorUncheckedCreateInput, "createdAt" | "updatedAt"> & {
  id: string;
};

// RUT y teléfonos inventados.
const conductores: ConductorSeed[] = [
  // Empresa A
  {
    id: "a2000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_A,
    nombre: "Pedro Soto (ficticio)",
    rut: "11111111-1",
    telefono: "+56900000001",
    activo: true,
    email: "pedro.soto@cordillera.example",
  },
  {
    id: "a2000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_A,
    nombre: "María Muñoz (ficticia)",
    rut: "22222222-2",
    telefono: "+56900000002",
    activo: true,
  },
  {
    id: "a2000000-0000-4000-8000-000000000003",
    empresaId: EMPRESA_A,
    nombre: "Luis Rojas (ficticio)",
    rut: "33333333-3",
    telefono: "+56900000003",
    activo: false,
  },
  // Empresa B: repite el RUT 11111111-1 a propósito.
  {
    id: "b2000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_B,
    nombre: "Pedro Soto (ficticio)",
    rut: "11111111-1",
    telefono: "+56900000001",
    activo: true,
  },
  {
    id: "b2000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_B,
    nombre: "Ana Díaz (ficticia)",
    rut: "44444444-4",
    telefono: "+56900000004",
    activo: true,
  },
];

// Turnos de ayer a 3 días más, contados desde el día en que se carga el seed por primera vez.
// Incluyen los casos de JOA-14: doblar jornada, un anulado con otro turno en su lugar, y avisos
// por vehículo en mantención y conductor inactivo. La empresa B repite patente, conductor, fecha
// y jornada de la A, porque cada empresa tiene sus propios turnos.
const hoy = hoyEnChile();
const dia = (dias: number) => fechaParaBase(sumarDias(hoy, dias));

const turnos: Prisma.TurnoCreateManyInput[] = [
  // Empresa A
  {
    id: "a3000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_A,
    fecha: dia(-1),
    jornada: "manana",
    vehiculoId: "a1000000-0000-4000-8000-000000000001", // BBCD12
    conductorId: "a2000000-0000-4000-8000-000000000001", // Pedro Soto
  },
  {
    id: "a3000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_A,
    fecha: dia(0),
    jornada: "manana",
    vehiculoId: "a1000000-0000-4000-8000-000000000001", // BBCD12
    conductorId: "a2000000-0000-4000-8000-000000000001", // Pedro Soto
  },
  {
    id: "a3000000-0000-4000-8000-000000000003",
    empresaId: EMPRESA_A,
    fecha: dia(0),
    jornada: "tarde",
    vehiculoId: "a1000000-0000-4000-8000-000000000003", // FGHJ34
    conductorId: "a2000000-0000-4000-8000-000000000002", // María Muñoz
  },
  {
    id: "a3000000-0000-4000-8000-000000000004",
    empresaId: EMPRESA_A,
    fecha: dia(0),
    jornada: "noche",
    vehiculoId: "a1000000-0000-4000-8000-000000000001", // BBCD12
    conductorId: "a2000000-0000-4000-8000-000000000001", // Pedro Soto
  },
  {
    id: "a3000000-0000-4000-8000-000000000005",
    empresaId: EMPRESA_A,
    fecha: dia(1),
    jornada: "manana",
    vehiculoId: "a1000000-0000-4000-8000-000000000003", // FGHJ34
    conductorId: "a2000000-0000-4000-8000-000000000002", // María Muñoz
    anulado: true,
    motivoAnulacion: "Se cambió el recorrido.",
  },
  {
    id: "a3000000-0000-4000-8000-000000000006",
    empresaId: EMPRESA_A,
    fecha: dia(1),
    jornada: "manana",
    vehiculoId: "a1000000-0000-4000-8000-000000000003", // FGHJ34
    conductorId: "a2000000-0000-4000-8000-000000000001", // Pedro Soto
  },
  {
    id: "a3000000-0000-4000-8000-000000000007",
    empresaId: EMPRESA_A,
    fecha: dia(2),
    jornada: "tarde",
    vehiculoId: "a1000000-0000-4000-8000-000000000002", // HJKL78, en mantención
    conductorId: "a2000000-0000-4000-8000-000000000002", // María Muñoz
  },
  {
    id: "a3000000-0000-4000-8000-000000000008",
    empresaId: EMPRESA_A,
    fecha: dia(3),
    jornada: "manana",
    vehiculoId: "a1000000-0000-4000-8000-000000000001", // BBCD12
    conductorId: "a2000000-0000-4000-8000-000000000003", // Luis Rojas, inactivo
  },
  // Empresa B
  {
    id: "b3000000-0000-4000-8000-000000000001",
    empresaId: EMPRESA_B,
    fecha: dia(0),
    jornada: "manana",
    vehiculoId: "b1000000-0000-4000-8000-000000000001", // BBCD12
    conductorId: "b2000000-0000-4000-8000-000000000001", // Pedro Soto
  },
  {
    id: "b3000000-0000-4000-8000-000000000002",
    empresaId: EMPRESA_B,
    fecha: dia(0),
    jornada: "tarde",
    vehiculoId: "b1000000-0000-4000-8000-000000000003", // KLPR56
    conductorId: "b2000000-0000-4000-8000-000000000002", // Ana Díaz
  },
  {
    id: "b3000000-0000-4000-8000-000000000003",
    empresaId: EMPRESA_B,
    fecha: dia(1),
    jornada: "noche",
    vehiculoId: "b1000000-0000-4000-8000-000000000003", // KLPR56
    conductorId: "b2000000-0000-4000-8000-000000000002", // Ana Díaz
  },
];

async function main() {
  for (const { id, ...datos } of empresas) {
    await prisma.empresa.upsert({ where: { id }, update: {}, create: { id, ...datos } });
  }
  for (const { id, ...datos } of vehiculos) {
    await prisma.vehiculo.upsert({ where: { id }, update: {}, create: { id, ...datos } });
  }
  for (const { id, ...datos } of conductores) {
    await prisma.conductor.upsert({ where: { id }, update: {}, create: { id, ...datos } });
  }
  // Se salta los turnos que ya existen y los que chocan con otro turno de esa fecha y jornada.
  await prisma.turno.createMany({ data: turnos, skipDuplicates: true });
  console.log(
    `Seed listo: ${empresas.length} empresas, ${vehiculos.length} vehículos, ${conductores.length} conductores y ${turnos.length} turnos.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
