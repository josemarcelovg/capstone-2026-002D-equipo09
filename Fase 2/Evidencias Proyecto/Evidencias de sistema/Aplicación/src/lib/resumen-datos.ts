import type { Prisma } from "../generated/prisma/client.ts";
import { filtroDocumentos } from "./documentos-filtros.ts";
import { fechaParaBase } from "./fechas.ts";
import type { ResumenFlota } from "./resumen.ts";
import { ESTADOS } from "./vehiculos.ts";

// Totales del resumen de la flota (JOA-50). No se guarda nada: se calculan cada vez con la fecha
// de hoy en Chile. Los documentos usan los mismos filtros del listado, así los números del
// resumen coinciden con lo que muestra cada enlace. Recibe la base para poder probarlo.

type BaseDeDatos = Pick<Prisma.TransactionClient, "vehiculo" | "documento">;

export async function resumenDeLaFlota({
  db,
  empresaId,
  hoy,
}: {
  db: BaseDeDatos;
  empresaId: string;
  hoy: string;
}): Promise<ResumenFlota> {
  const porEstado = await db.vehiculo.groupBy({
    by: ["estado"],
    where: { empresaId },
    _count: { _all: true },
  });
  const cantidad = Object.fromEntries(
    ESTADOS.map((estado) => [estado, porEstado.find((fila) => fila.estado === estado)?._count._all ?? 0]),
  ) as ResumenFlota["vehiculos"];

  const contar = (where: Prisma.DocumentoWhereInput) => db.documento.count({ where });
  const documentos = {
    total: await contar(filtroDocumentos(empresaId, hoy)),
    vencidos: await contar(filtroDocumentos(empresaId, hoy, { estado: "vencido" })),
    porVencer: await contar(filtroDocumentos(empresaId, hoy, { estado: "por_vencer" })),
    vencenHoy: await contar({ ...filtroDocumentos(empresaId, hoy), fechaVencimiento: fechaParaBase(hoy) }),
  };

  return {
    vehiculos: { ...cantidad, total: ESTADOS.reduce((suma, estado) => suma + cantidad[estado], 0) },
    documentos,
  };
}
