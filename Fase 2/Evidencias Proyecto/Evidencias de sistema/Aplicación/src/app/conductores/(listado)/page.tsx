import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { formatearTelefono } from "@/lib/conductores";
import { listarConductores } from "@/lib/conductores-datos";
import { formatearRut } from "@/lib/rut";
import { InsigniaEstado } from "../insignia-estado";

export const metadata: Metadata = { title: "Conductores" };

const MENSAJES = new Map([
  ["creado", "Conductor registrado correctamente."],
  ["actualizado", "Los cambios del conductor se guardaron."],
  ["desactivado", "Conductor desactivado. Puedes verlo marcando «Incluir inactivos»."],
  ["reactivado", "Conductor reactivado."],
]);

const BOTON_PRINCIPAL =
  "rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800";
const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30";

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

export default async function PaginaConductores({ searchParams }: PageProps<"/conductores">) {
  const parametros = await searchParams;
  const buscar = primero(parametros.buscar).slice(0, 100);
  const incluirInactivos = primero(parametros.inactivos) === "1";
  const mensaje = MENSAJES.get(primero(parametros.mensaje));

  const conductores = await listarConductores({ buscar, incluirInactivos });
  const sinRegistros =
    conductores.length === 0 && (await listarConductores({ incluirInactivos: true })).length === 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Conductores</h1>
        <Link href="/conductores/nuevo" className={BOTON_PRINCIPAL}>
          Registrar conductor
        </Link>
      </div>

      {mensaje && (
        <p role="status" className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {mensaje}
        </p>
      )}

      {sinRegistros ? (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-12 text-center">
          <p className="text-zinc-700">Aún no tienes conductores registrados</p>
          <Link href="/conductores/nuevo" className={`mt-4 inline-block ${BOTON_PRINCIPAL}`}>
            Registrar conductor
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/conductores"
            className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end"
          >
            <div>
              <label htmlFor="buscar" className="text-sm font-medium text-zinc-800">
                Buscar por nombre o RUT
              </label>
              <input
                id="buscar"
                name="buscar"
                type="search"
                defaultValue={buscar}
                placeholder="Juan o 12.345.678-9"
                maxLength={100}
                autoComplete="off"
                className={CONTROL}
              />
            </div>
            <label className="flex items-center gap-2 py-2.5 text-sm text-zinc-800">
              <input
                type="checkbox"
                name="inactivos"
                value="1"
                defaultChecked={incluirInactivos}
                className="size-4 accent-blue-700"
              />
              Incluir inactivos
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Buscar
              </button>
              {(buscar || incluirInactivos) && (
                <Link
                  href="/conductores"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-blue-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {conductores.length === 0 ? (
            <p className="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-700">
              No hay conductores que coincidan con la búsqueda.
            </p>
          ) : (
            <>
              {/* Celular: una tarjeta por conductor */}
              <ul className="mt-4 grid gap-3 sm:hidden">
                {conductores.map((conductor) => (
                  <li key={conductor.id}>
                    <Link
                      href={`/conductores/${conductor.id}`}
                      className="block rounded-lg border border-zinc-200 bg-white p-4 active:bg-zinc-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate font-semibold text-zinc-900">
                          {conductor.nombre}
                        </span>
                        <InsigniaEstado activo={conductor.activo} />
                      </div>
                      <p className="mt-1 font-mono text-sm text-zinc-800">{formatearRut(conductor.rut)}</p>
                      <p className="text-sm text-zinc-600">{formatearTelefono(conductor.telefono)}</p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla */}
              <div className="mt-4 hidden overflow-hidden rounded-lg border border-zinc-200 bg-white sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
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
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {conductores.map((conductor) => (
                      <tr key={conductor.id}>
                        <td className="px-4 py-3 font-semibold text-zinc-900">{conductor.nombre}</td>
                        <td className="px-4 py-3 font-mono whitespace-nowrap">{formatearRut(conductor.rut)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatearTelefono(conductor.telefono)}</td>
                        <td className="px-4 py-3">
                          <InsigniaEstado activo={conductor.activo} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/conductores/${conductor.id}`}
                            className="font-medium text-blue-800 hover:underline"
                            aria-label={`Ver / editar a ${conductor.nombre}`}
                          >
                            Ver / editar
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
