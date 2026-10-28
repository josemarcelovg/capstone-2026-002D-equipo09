import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client.ts";

// Datos ficticios para desarrollo y para las pruebas de SIM-03 (JOA-01, secciones 6 y 7).
// Dos empresas inventadas; ninguna persona ni empresa real.
// Los id son fijos para que el seed se pueda ejecutar varias veces sin duplicar datos.
// Los usuarios no se crean aquí: su id debe ser el de Supabase Auth (ver SIM-02).

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
  // Empresa B: repite BBCD12 a propósito (otra empresa sí puede tenerla).
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

// RUT de dígitos repetidos (válidos y claramente ficticios) y teléfonos +56 9 0000 00XX
// (JOA-09, sección 5): ninguno es de una persona real.
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
  // Empresa B: repite el RUT 11111111-1 a propósito (otra empresa sí puede tenerlo).
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

async function main() {
  for (const { id, ...datos } of empresas) {
    await prisma.empresa.upsert({ where: { id }, update: datos, create: { id, ...datos } });
  }
  for (const { id, ...datos } of vehiculos) {
    await prisma.vehiculo.upsert({ where: { id }, update: datos, create: { id, ...datos } });
  }
  for (const { id, ...datos } of conductores) {
    await prisma.conductor.upsert({ where: { id }, update: datos, create: { id, ...datos } });
  }
  console.log(
    `Seed listo: ${empresas.length} empresas, ${vehiculos.length} vehículos y ${conductores.length} conductores.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
