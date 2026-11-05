import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client.ts";

// Comprobación de JOS-02 contra la base de datos real (después de migrar y ejecutar el seed).
// Crea y consulta vehículos de la empresa de prueba dentro de una transacción que al final
// se deshace, así que no deja datos nuevos. La salida sirve como evidencia para el PR.

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

const EMPRESA_A = "a0000000-0000-4000-8000-000000000001";
const EMPRESA_B = "b0000000-0000-4000-8000-000000000002";
const VEHICULO_DE_B = "b1000000-0000-4000-8000-000000000002";

let fallas = 0;
function comprobar(descripcion: string, ok: boolean) {
  console.log(`${ok ? "✔" : "✘"} ${descripcion}`);
  if (!ok) fallas++;
}

class Deshacer extends Error {}

async function main() {
  await prisma
    .$transaction(async (tx) => {
      const creado = await tx.vehiculo.create({
        data: {
          empresaId: EMPRESA_A,
          patente: "ZZZZ99",
          tipo: "van",
          marca: "Prueba",
          modelo: "Comprobación",
          anio: 2024,
          capacidadPasajeros: 12,
        },
      });
      comprobar("Crea un vehículo en la empresa A con estado 'activo' por defecto", creado.estado === "activo");

      const deA = await tx.vehiculo.findMany({
        where: { empresaId: EMPRESA_A, estado: { not: "inactivo" } },
        orderBy: { patente: "asc" },
      });
      comprobar(
        "El listado de A incluye el vehículo nuevo, sin inactivos y ordenado por patente",
        deA.some((v) => v.id === creado.id) &&
          deA.every((v) => v.empresaId === EMPRESA_A && v.estado !== "inactivo") &&
          deA.map((v) => v.patente).join() === deA.map((v) => v.patente).sort().join(),
      );

      const deOtraEmpresa = await tx.vehiculo.findFirst({
        where: { id: VEHICULO_DE_B, empresaId: EMPRESA_A },
      });
      comprobar("Buscar por id un vehículo de B filtrando por A no lo encuentra", deOtraEmpresa === null);

      await tx.vehiculo.create({
        data: {
          empresaId: EMPRESA_B,
          patente: "ZZZZ99",
          tipo: "bus",
          marca: "Prueba",
          modelo: "Comprobación",
          anio: 2024,
          capacidadPasajeros: 40,
        },
      });
      comprobar("La empresa B puede registrar la misma patente que A", true);

      throw new Deshacer();
    })
    .catch((error) => {
      if (!(error instanceof Deshacer)) throw error;
    });

  // Fuera de la transacción: el intento falla y no crea nada.
  try {
    await prisma.vehiculo.create({
      data: {
        empresaId: EMPRESA_A,
        patente: "BBCD12",
        tipo: "minibus",
        marca: "Prueba",
        modelo: "Duplicado",
        anio: 2024,
        capacidadPasajeros: 20,
      },
    });
    comprobar("Rechaza una patente repetida dentro de la misma empresa", false);
  } catch (error) {
    const duplicada =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    comprobar("Rechaza una patente repetida dentro de la misma empresa (error P2002)", duplicada);
    if (!duplicada) throw error;
  }

  const sobrantes = await prisma.vehiculo.count({ where: { patente: "ZZZZ99" } });
  comprobar("No quedan datos de la comprobación en la base", sobrantes === 0);

  console.log(fallas === 0 ? "\nTodo correcto." : `\n${fallas} comprobación(es) fallaron.`);
  if (fallas > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
