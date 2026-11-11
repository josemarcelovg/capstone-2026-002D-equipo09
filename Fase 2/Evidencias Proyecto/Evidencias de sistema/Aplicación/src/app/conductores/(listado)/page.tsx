import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { formatearTelefono, textoVehiculosSinConductor } from "@/lib/conductores";
import { listarConductores } from "@/lib/conductores-datos";
import { formatearRut } from "@/lib/rut";
import { Encabezado, MensajeExito } from "../../encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL, TARJETA } from "../../estilos";
import { IconoBuscar, IconoConductor, IconoFlecha, IconoMas } from "../../iconos";
import { BARRA_ESTADO } from "../../insignia";
import { InsigniaEstado, tonoConductor } from "../insignia-estado";

export const metadata: Metadata = { title: "Conductores" };

const MENSAJES = new Map([
  ["creado", "Conductor registrado correctamente."],
  ["actualizado", "Los cambios del conductor se guardaron."],
  ["desactivado", "Conductor desactivado. Puedes verlo marcando «Incluir inactivos»."],
  ["reactivado", "Conductor reactivado."],
]);

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

/** Iniciales del nombre para el círculo del listado (solo decorativo). */
function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("");
}

function Avatar({ nombre }: { nombre: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-900"
    >
      {iniciales(nombre)}
    </span>
  );
}

export default async function PaginaConductores({ searchParams }: PageProps<"/conductores">) {
  const parametros = await searchParams;
  const buscar = primero(parametros.buscar).slice(0, 100);
  const incluirInactivos = primero(parametros.inactivos) === "1";
  const sinConductor = Number(primero(parametros.sinConductor));
  const mensaje = [
    MENSAJES.get(primero(parametros.mensaje)),
    // Al desactivar, sus vehículos quedan sin conductor asignado (PB-24, criterio 4).
    primero(parametros.mensaje) === "desactivado" && Number.isInteger(sinConductor) && sinConductor > 0
      ? textoVehiculosSinConductor(sinConductor)
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const conductores = await listarConductores({ buscar, incluirInactivos });
  const sinRegistros =
    conductores.length === 0 && (await listarConductores({ incluirInactivos: true })).length === 0;

  return (
    <>
      <Encabezado titulo="Conductores" descripcion="Registra y controla a los conductores de tu empresa.">
        <Link href="/conductores/nuevo" className={BOTON_PRINCIPAL}>
          <IconoMas className="size-4" />
          Registrar conductor
        </Link>
      </Encabezado>

      {mensaje && <MensajeExito>{mensaje}</MensajeExito>}

      {sinRegistros ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
            <IconoConductor className="size-6" />
          </span>
          <p className="mt-3 font-medium text-stone-800">Aún no tienes conductores registrados</p>
          <Link href="/conductores/nuevo" className={`mt-4 ${BOTON_PRINCIPAL}`}>
            <IconoMas className="size-4" />
            Registrar conductor
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/conductores"
            className={`${TARJETA} mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end`}
          >
            <div>
              <label htmlFor="buscar" className="text-sm font-medium text-stone-800">
                Buscar por nombre o RUT
              </label>
              <div className="relative">
                <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  id="buscar"
                  name="buscar"
                  type="search"
                  defaultValue={buscar}
                  placeholder="Juan o 12.345.678-9"
                  maxLength={100}
                  autoComplete="off"
                  className={`${CONTROL} pl-9`}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 py-2.5 text-sm text-stone-800">
              <input
                type="checkbox"
                name="inactivos"
                value="1"
                defaultChecked={incluirInactivos}
                className="size-4 accent-orange-700"
              />
              Incluir inactivos
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`${BOTON_SECUNDARIO} flex-1`}
              >
                Buscar
              </button>
              {(buscar || incluirInactivos) && (
                <Link
                  href="/conductores"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-orange-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {conductores.length === 0 ? (
            <p className={`${TARJETA} mt-6 px-4 py-8 text-center text-stone-700`}>
              No hay conductores que coincidan con la búsqueda.
            </p>
          ) : (
            <>
              {/* Celular y tablet: una tarjeta por conductor */}
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
                {conductores.map((conductor) => (
                  <li key={conductor.id}>
                    <Link
                      href={`/conductores/${conductor.id}`}
                      className={`${TARJETA} ${BARRA_ESTADO[tonoConductor(conductor.activo)]} block p-4 transition-colors hover:border-orange-300 active:bg-orange-50`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-3">
                          <Avatar nombre={conductor.nombre} />
                          <span className="truncate font-semibold text-stone-900">{conductor.nombre}</span>
                        </span>
                        <InsigniaEstado activo={conductor.activo} />
                      </div>
                      <p className="mt-1 font-mono text-sm text-stone-800">{formatearRut(conductor.rut)}</p>
                      <p className="text-sm text-stone-600">{formatearTelefono(conductor.telefono)}</p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla (con el menú lateral, la tabla necesita una pantalla ancha) */}
              <div className={`${TARJETA} mt-4 hidden overflow-hidden lg:block`}>
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                      <th scope="col" className="px-4 py-3 font-medium">RUT</th>
                      <th scope="col" className="px-4 py-3 font-medium">Teléfono</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {conductores.map((conductor) => (
                      <tr key={conductor.id} className="transition-colors hover:bg-orange-50/60">
                        <td className={`px-4 py-3 font-semibold text-stone-900 ${BARRA_ESTADO[tonoConductor(conductor.activo)]}`}>
                          <span className="flex items-center gap-3">
                            <Avatar nombre={conductor.nombre} />
                            {conductor.nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono whitespace-nowrap">{formatearRut(conductor.rut)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatearTelefono(conductor.telefono)}</td>
                        <td className="px-4 py-3">
                          <InsigniaEstado activo={conductor.activo} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/conductores/${conductor.id}`}
                            className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-orange-800 hover:underline"
                            aria-label={`Ver / editar a ${conductor.nombre}`}
                          >
                            Ver / editar
                            <IconoFlecha className="size-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
