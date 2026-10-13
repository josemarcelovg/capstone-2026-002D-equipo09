import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_TIPO, formatearPatente } from "@/lib/vehiculos";
import { listarVehiculos } from "@/lib/vehiculos-datos";
import { InsigniaEstado } from "./insignia-estado";

export const metadata: Metadata = { title: "Vehículos" };

const MENSAJES = new Map([
  ["creado", "Vehículo registrado correctamente."],
  ["actualizado", "Los cambios del vehículo se guardaron."],
  ["desactivado", "Vehículo desactivado. Puedes verlo marcando «Incluir inactivos»."],
  ["reactivado", "Vehículo reactivado."],
]);

const BOTON_PRINCIPAL =
  "rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800";
const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30";

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

export default async function PaginaVehiculos({ searchParams }: PageProps<"/vehiculos">) {
  const parametros = await searchParams;
  const patente = primero(parametros.patente);
  const estado = ESTADOS.find((opcion) => opcion === primero(parametros.estado));
  const incluirInactivos = primero(parametros.inactivos) === "1";
  const mensaje = MENSAJES.get(primero(parametros.mensaje));

  const vehiculos = await listarVehiculos({ patente, estado, incluirInactivos });
  const sinRegistros =
    vehiculos.length === 0 && (await listarVehiculos({ incluirInactivos: true })).length === 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Vehículos</h1>
        <Link href="/vehiculos/nuevo" className={BOTON_PRINCIPAL}>
          Registrar vehículo
        </Link>
      </div>

      {mensaje && (
        <p role="status" className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {mensaje}
        </p>
      )}

      {sinRegistros ? (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-12 text-center">
          <p className="text-zinc-700">Aún no tienes vehículos registrados</p>
          <Link href="/vehiculos/nuevo" className={`mt-4 inline-block ${BOTON_PRINCIPAL}`}>
            Registrar vehículo
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/vehiculos"
            className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <div>
              <label htmlFor="patente" className="text-sm font-medium text-zinc-800">
                Buscar por patente
              </label>
              <input
                id="patente"
                name="patente"
                type="search"
                defaultValue={patente}
                placeholder="BBCD12"
                autoComplete="off"
                className={CONTROL}
              />
            </div>
            <div>
              <label htmlFor="estado" className="text-sm font-medium text-zinc-800">
                Estado
              </label>
              <select id="estado" name="estado" defaultValue={estado ?? ""} className={CONTROL}>
                <option value="">Todos</option>
                {ESTADOS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {ETIQUETA_ESTADO[opcion]}
                  </option>
                ))}
              </select>
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
              {(patente || estado || incluirInactivos) && (
                <Link
                  href="/vehiculos"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-blue-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {vehiculos.length === 0 ? (
            <p className="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-700">
              No hay vehículos que coincidan con la búsqueda.
            </p>
          ) : (
            <>
              {/* Celular: una tarjeta por vehículo */}
              <ul className="mt-4 grid gap-3 sm:hidden">
                {vehiculos.map((vehiculo) => (
                  <li key={vehiculo.id}>
                    <Link
                      href={`/vehiculos/${vehiculo.id}`}
                      className="block rounded-lg border border-zinc-200 bg-white p-4 active:bg-zinc-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-lg font-semibold text-zinc-900">
                          {formatearPatente(vehiculo.patente)}
                        </span>
                        <InsigniaEstado estado={vehiculo.estado} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-800">
                        {vehiculo.marca} {vehiculo.modelo} · {vehiculo.anio}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {ETIQUETA_TIPO[vehiculo.tipo]}
                        {vehiculo.numeroInterno && ` · N.º interno ${vehiculo.numeroInterno}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla */}
              <div className="mt-4 hidden overflow-hidden rounded-lg border border-zinc-200 bg-white sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Patente</th>
                      <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
                      <th scope="col" className="px-4 py-3 font-medium">Marca y modelo</th>
                      <th scope="col" className="px-4 py-3 font-medium">Año</th>
                      <th scope="col" className="px-4 py-3 font-medium">N.º interno</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {vehiculos.map((vehiculo) => (
                      <tr key={vehiculo.id}>
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900">
                          {formatearPatente(vehiculo.patente)}
                        </td>
                        <td className="px-4 py-3">{ETIQUETA_TIPO[vehiculo.tipo]}</td>
                        <td className="px-4 py-3">
                          {vehiculo.marca} {vehiculo.modelo}
                        </td>
                        <td className="px-4 py-3">{vehiculo.anio}</td>
                        <td className="px-4 py-3">{vehiculo.numeroInterno ?? "—"}</td>
                        <td className="px-4 py-3">
                          <InsigniaEstado estado={vehiculo.estado} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/vehiculos/${vehiculo.id}`}
                            className="font-medium text-blue-800 hover:underline"
                            aria-label={`Ver o editar ${formatearPatente(vehiculo.patente)}`}
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
