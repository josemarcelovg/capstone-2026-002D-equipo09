import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { listarConductores } from "@/lib/conductores-datos";
import { esFechaValida, formatearFecha, sumarDias } from "@/lib/fechas";
import { ETIQUETA_JORNADA, JORNADAS, MENSAJES_TURNO, rangoDeFechasTurno } from "@/lib/turnos";
import { turnosDelDia, turnosDesdeHoy } from "@/lib/turnos-datos";
import { contextoDeTurnos } from "@/lib/turnos-sesion";
import { formatearPatente } from "@/lib/vehiculos";
import { listarVehiculos } from "@/lib/vehiculos-datos";
import { Encabezado, MensajeExito } from "../../encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL, TARJETA } from "../../estilos";
import { IconoMas, IconoTurno } from "../../iconos";
import { TarjetaTurno } from "../tarjeta-turno";

export const metadata: Metadata = { title: "Turnos" };

const MENSAJES = new Map([
  ["asignado", MENSAJES_TURNO.asignado],
  ["editado", MENSAJES_TURNO.editado],
  ["anulado", MENSAJES_TURNO.anulado],
]);

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

export default async function PaginaTurnos({ searchParams }: PageProps<"/turnos">) {
  const parametros = await searchParams;
  const contexto = await contextoDeTurnos();
  const { hoy } = contexto;

  const pedida = primero(parametros.fecha);
  const fecha = esFechaValida(pedida) ? pedida : hoy;
  const vehiculoId = primero(parametros.vehiculo) || undefined;
  const conductorId = primero(parametros.conductor) || undefined;
  const filtrando = Boolean(vehiculoId || conductorId);
  // Una casilla sin marcar no viaja en la URL: sin filtro, viene marcada por defecto.
  const ocultarAnulados = !filtrando || primero(parametros.ocultar) === "1";
  const mensaje = MENSAJES.get(primero(parametros.mensaje));

  const [turnos, vehiculos, conductores] = await Promise.all([
    filtrando
      ? turnosDesdeHoy(contexto, { vehiculoId, conductorId, incluirAnulados: !ocultarAnulados })
      : turnosDelDia(contexto, fecha),
    listarVehiculos({ incluirInactivos: true }),
    listarConductores({ incluirInactivos: true }),
  ]);

  const { minima, maxima } = rangoDeFechasTurno(hoy);
  const enRango = fecha >= minima && fecha <= maxima;
  const asignar = enRango ? `/turnos/nuevo?fecha=${fecha}` : "/turnos/nuevo";

  return (
    <>
      <Encabezado titulo="Turnos" descripcion="Revisa quién sale cada día y asigna vehículo y conductor.">
        <Link href={asignar} className={BOTON_PRINCIPAL}>
          <IconoMas className="size-4" />
          Asignar turno
        </Link>
      </Encabezado>

      {mensaje && <MensajeExito>{mensaje}</MensajeExito>}

      {/* Plegado para que en el celular los turnos del día queden arriba. */}
      <details key={`${vehiculoId}-${conductorId}-${ocultarAnulados}`} open={filtrando} className={`${TARJETA} mt-6 p-4`}>
        <summary className="cursor-pointer text-sm font-medium text-stone-800">
          Filtrar por vehículo o conductor
        </summary>
        <Form
          action="/turnos"
          className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end"
        >
          <input type="hidden" name="fecha" value={fecha} />
          <div className="min-w-0">
            <label htmlFor="vehiculo" className="text-sm font-medium text-stone-800">
              Filtrar por vehículo
            </label>
            <select id="vehiculo" name="vehiculo" defaultValue={vehiculoId ?? ""} className={CONTROL}>
              <option value="">Todos</option>
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {formatearPatente(vehiculo.patente)}
                  {vehiculo.numeroInterno ? ` · N° ${vehiculo.numeroInterno}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="conductor" className="text-sm font-medium text-stone-800">
              Filtrar por conductor
            </label>
            <select id="conductor" name="conductor" defaultValue={conductorId ?? ""} className={CONTROL}>
              <option value="">Todos</option>
              {conductores.map((conductor) => (
                <option key={conductor.id} value={conductor.id}>
                  {conductor.nombre}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 py-2.5 text-sm text-stone-800">
            <input
              type="checkbox"
              name="ocultar"
              value="1"
              defaultChecked={ocultarAnulados}
              className="size-4 accent-orange-700"
            />
            Ocultar anulados
          </label>
          <div className="flex gap-2">
            <button type="submit" className={`${BOTON_SECUNDARIO} flex-1`}>
              Filtrar
            </button>
            {filtrando && (
              <Link
                href={`/turnos?fecha=${fecha}`}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-orange-800 hover:underline"
              >
                Limpiar
              </Link>
            )}
          </div>
        </Form>
      </details>

      {filtrando ? (
        <section aria-labelledby="titulo-filtro" className="mt-6">
          <h2 id="titulo-filtro" className="text-lg font-semibold text-stone-900">
            Turnos desde hoy
          </h2>
          {turnos.length === 0 ? (
            <p className={`${TARJETA} mt-3 px-4 py-8 text-center text-stone-700`}>
              No hay turnos desde hoy con este filtro.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {turnos.map((turno) => (
                <li key={turno.id}>
                  <TarjetaTurno turno={turno} hoy={hoy} conFecha />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <nav aria-label="Cambiar de día" className="grid grid-cols-3 gap-2">
              <Link href={`/turnos?fecha=${sumarDias(fecha, -1)}`} className={BOTON_SECUNDARIO}>
                Día anterior
              </Link>
              <Link href="/turnos" className={BOTON_SECUNDARIO}>
                Hoy
              </Link>
              <Link href={`/turnos?fecha=${sumarDias(fecha, 1)}`} className={BOTON_SECUNDARIO}>
                Día siguiente
              </Link>
            </nav>
            <Form key={fecha} action="/turnos" className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="fecha" className="text-sm font-medium text-stone-800">
                  Ir a la fecha
                </label>
                <input id="fecha" name="fecha" type="date" defaultValue={fecha} className={CONTROL} />
              </div>
              <button type="submit" className={BOTON_SECUNDARIO}>
                Ver
              </button>
            </Form>
          </div>

          <h2 className="mt-6 text-lg font-semibold text-stone-900">
            {formatearFecha(fecha)}
            {fecha === hoy && <span className="font-normal text-stone-600"> · Hoy</span>}
          </h2>

          {turnos.length === 0 ? (
            <div className="mt-3 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-12 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
                <IconoTurno className="size-6" />
              </span>
              <p className="mt-3 font-medium text-stone-800">{MENSAJES_TURNO.sinTurnos}</p>
              <Link href={asignar} className={`mt-4 ${BOTON_PRINCIPAL}`}>
                <IconoMas className="size-4" />
                Asignar turno
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              {JORNADAS.map((jornada) => {
                const delBloque = turnos.filter((turno) => turno.jornada === jornada);
                return (
                  <section
                    key={jornada}
                    aria-labelledby={`jornada-${jornada}`}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-3"
                  >
                    <h3 id={`jornada-${jornada}`} className="font-semibold text-stone-900">
                      {ETIQUETA_JORNADA[jornada]}
                    </h3>
                    {delBloque.length === 0 ? (
                      <p className="mt-2 text-sm text-stone-600">Sin turnos en esta jornada.</p>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {delBloque.map((turno) => (
                          <li key={turno.id}>
                            <TarjetaTurno turno={turno} hoy={hoy} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
