import Link from "next/link";
import { formatearFecha } from "@/lib/fechas";
import { avisosDelTurno, ETIQUETA_JORNADA, sePuedeModificar } from "@/lib/turnos";
import type { Turno } from "@/lib/turnos-datos";
import { formatearPatente } from "@/lib/vehiculos";
import { ETIQUETA_PATENTE, TARJETA } from "../estilos";
import { BARRA_ESTADO, Insignia, type Tono } from "../insignia";

const tonoDelAviso = (aviso: string): Tono =>
  aviso === "Anulado" ? "gris" : aviso === "Vehículo en mantención" ? "amarillo" : "rojo";

// Un turno con su vehículo, conductor y avisos. Con `conFecha` muestra también el día y la jornada.
export function TarjetaTurno({
  turno,
  hoy,
  conFecha = false,
}: {
  turno: Turno;
  hoy: string;
  conFecha?: boolean;
}) {
  const avisos = avisosDelTurno({
    anulado: turno.anulado,
    estadoVehiculo: turno.vehiculo.estado,
    conductorActivo: turno.conductor.activo,
  });
  const barra = turno.anulado ? "gris" : avisos.length > 0 ? tonoDelAviso(avisos[0]) : "verde";
  const tachado = turno.anulado ? "line-through" : "";
  const patente = formatearPatente(turno.vehiculo.patente);

  return (
    <article className={`${TARJETA} ${BARRA_ESTADO[barra]} p-3`}>
      {conFecha && (
        <p className="mb-1 text-sm font-medium text-stone-700">
          {formatearFecha(turno.fecha)} · {ETIQUETA_JORNADA[turno.jornada]}
        </p>
      )}
      <p className={`flex flex-wrap items-center gap-2 text-sm text-stone-700 ${tachado}`}>
        <span className={ETIQUETA_PATENTE}>{patente}</span>
        {turno.vehiculo.numeroInterno && <span>N° {turno.vehiculo.numeroInterno}</span>}
      </p>
      <p className={`mt-1 font-semibold break-words text-stone-900 ${tachado}`}>{turno.conductor.nombre}</p>

      {avisos.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {avisos.map((aviso) => (
            <Insignia key={aviso} tono={tonoDelAviso(aviso)}>
              {aviso}
            </Insignia>
          ))}
        </p>
      )}
      {turno.anulado && turno.motivoAnulacion && (
        <p className="mt-1 text-sm break-words text-stone-700">Motivo: {turno.motivoAnulacion}</p>
      )}

      {sePuedeModificar(turno, hoy) && (
        <Link
          href={`/turnos/${turno.id}`}
          aria-label={`Editar el turno de ${patente} con ${turno.conductor.nombre}`}
          className="mt-2 inline-block text-sm font-medium text-orange-800 hover:underline"
        >
          Editar
        </Link>
      )}
    </article>
  );
}
