import type { Metadata } from "next";
import Link from "next/link";
import { esFechaValida } from "@/lib/fechas";
import { JORNADAS } from "@/lib/turnos";
import { opcionesDeTurno } from "@/lib/turnos-datos";
import { contextoDeTurnos } from "@/lib/turnos-sesion";
import { TurnoForm } from "../turno-form";

export const metadata: Metadata = { title: "Asignar turno" };

export default async function PaginaNuevoTurno({ searchParams }: PageProps<"/turnos/nuevo">) {
  const parametros = await searchParams;
  const contexto = await contextoDeTurnos();
  const fecha =
    typeof parametros.fecha === "string" && esFechaValida(parametros.fecha) ? parametros.fecha : contexto.hoy;
  const jornada = JORNADAS.find((opcion) => opcion === parametros.jornada);
  const opciones = await opcionesDeTurno(contexto, { fecha, jornada });

  return (
    <>
      <Link href={`/turnos?fecha=${fecha}`} className="text-sm font-medium text-orange-800 hover:underline">
        ← Volver a los turnos
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Asignar turno</h1>
      <TurnoForm hoy={contexto.hoy} fecha={fecha} jornada={jornada} opciones={opciones} />
    </>
  );
}
