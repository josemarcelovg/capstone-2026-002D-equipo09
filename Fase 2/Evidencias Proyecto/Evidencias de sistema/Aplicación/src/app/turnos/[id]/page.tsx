import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { esFechaValida } from "@/lib/fechas";
import { JORNADAS, MENSAJES_TURNO, preguntaAnular, sePuedeModificar } from "@/lib/turnos";
import { obtenerTurno, opcionesDeTurno } from "@/lib/turnos-datos";
import { contextoDeTurnos } from "@/lib/turnos-sesion";
import { TARJETA } from "../../estilos";
import { BotonAnular } from "../boton-anular";
import { TarjetaTurno } from "../tarjeta-turno";
import { TurnoForm } from "../turno-form";

// El título y la página usan la misma consulta.
const buscarTurno = cache(async (id: string) => obtenerTurno(await contextoDeTurnos(), id));

// Si el turno no existe o es de otra empresa, la pestaña también dice "No encontrado".
export async function generateMetadata({ params }: PageProps<"/turnos/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscarTurno(id)) ? "Detalle del turno" : "No encontrado" };
}

export default async function PaginaTurno({ params, searchParams }: PageProps<"/turnos/[id]">) {
  const { id } = await params;
  const turno = await buscarTurno(id);
  if (!turno) notFound();
  const parametros = await searchParams;
  const contexto = await contextoDeTurnos();

  const volver = (
    <Link href={`/turnos?fecha=${turno.fecha}`} className="text-sm font-medium text-orange-800 hover:underline">
      ← Volver a los turnos
    </Link>
  );

  if (!sePuedeModificar(turno, contexto.hoy)) {
    return (
      <>
        {volver}
        <h1 className="mt-2 mb-4 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Detalle del turno</h1>
        <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900">
          {MENSAJES_TURNO.noModificable}
        </p>
        <TarjetaTurno turno={turno} hoy={contexto.hoy} conFecha />
      </>
    );
  }

  // Lo que el usuario cambió en el formulario manda sobre lo guardado, para revisar quién está ocupado.
  const fecha =
    typeof parametros.fecha === "string" && esFechaValida(parametros.fecha) ? parametros.fecha : turno.fecha;
  const jornada = JORNADAS.find((opcion) => opcion === parametros.jornada) ?? turno.jornada;
  const opciones = await opcionesDeTurno(contexto, { fecha, jornada, turnoId: turno.id });

  return (
    <>
      {volver}
      <h1 className="mt-2 mb-4 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Editar turno</h1>
      <TurnoForm
        turnoId={turno.id}
        hoy={contexto.hoy}
        fecha={fecha}
        jornada={jornada}
        vehiculoId={turno.vehiculo.id}
        conductorId={turno.conductor.id}
        opciones={opciones}
      />
      <section className={`${TARJETA} mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
        <p className="text-sm text-stone-700">
          Si este turno ya no se va a realizar, anúlalo. No se borra y deja libres al vehículo y al conductor.
        </p>
        <BotonAnular
          id={turno.id}
          pregunta={preguntaAnular({
            fecha: turno.fecha,
            jornada: turno.jornada,
            patente: turno.vehiculo.patente,
            conductor: turno.conductor.nombre,
          })}
        />
      </section>
    </>
  );
}
