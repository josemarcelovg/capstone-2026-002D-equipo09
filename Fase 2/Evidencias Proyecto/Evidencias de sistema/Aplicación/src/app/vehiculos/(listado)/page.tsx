import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_TIPO, formatearPatente } from "@/lib/vehiculos";
import { listarVehiculos } from "@/lib/vehiculos-datos";
import { Encabezado, MensajeExito } from "../../encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL, ETIQUETA_PATENTE, TARJETA } from "../../estilos";
import { IconoBuscar, IconoBus, IconoFlecha, IconoMas } from "../../iconos";
import { BARRA_ESTADO } from "../../insignia";
import { InsigniaEstado, TONOS } from "../insignia-estado";

export const metadata: Metadata = { title: "Vehículos" };

const MENSAJES = new Map([
  ["creado", "Vehículo registrado correctamente."],
  ["actualizado", "Los cambios del vehículo se guardaron."],
  ["desactivado", "Vehículo desactivado. Puedes verlo marcando «Incluir inactivos»."],
  ["reactivado", "Vehículo reactivado."],
]);

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
      <Encabezado titulo="Vehículos" descripcion="Registra y controla los vehículos de tu empresa.">
        <Link href="/vehiculos/nuevo" className={BOTON_PRINCIPAL}>
          <IconoMas className="size-4" />
          Registrar vehículo
        </Link>
      </Encabezado>

      {mensaje && <MensajeExito>{mensaje}</MensajeExito>}

      {sinRegistros ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
            <IconoBus className="size-6" />
          </span>
          <p className="mt-3 font-medium text-stone-800">Aún no tienes vehículos registrados</p>
          <Link href="/vehiculos/nuevo" className={`mt-4 ${BOTON_PRINCIPAL}`}>
            <IconoMas className="size-4" />
            Registrar vehículo
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/vehiculos"
            className={`${TARJETA} mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end`}
          >
            <div>
              <label htmlFor="patente" className="text-sm font-medium text-stone-800">
                Buscar por patente
              </label>
              <div className="relative">
                <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  id="patente"
                  name="patente"
                  type="search"
                  defaultValue={patente}
                  placeholder="BBCD12"
                  autoComplete="off"
                  className={`${CONTROL} pl-9`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="estado" className="text-sm font-medium text-stone-800">
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
              {(patente || estado || incluirInactivos) && (
                <Link
                  href="/vehiculos"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-orange-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {vehiculos.length === 0 ? (
            <p className={`${TARJETA} mt-6 px-4 py-8 text-center text-stone-700`}>
              No hay vehículos que coincidan con la búsqueda.
            </p>
          ) : (
            <>
              {/* Celular: una tarjeta por vehículo */}
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
                {vehiculos.map((vehiculo) => (
                  <li key={vehiculo.id}>
                    <Link
                      href={`/vehiculos/${vehiculo.id}`}
                      className={`${TARJETA} ${BARRA_ESTADO[TONOS[vehiculo.estado]]} block p-4 transition-colors hover:border-orange-300 active:bg-orange-50`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`${ETIQUETA_PATENTE} font-mono text-base`}>
                          {formatearPatente(vehiculo.patente)}
                        </span>
                        <InsigniaEstado estado={vehiculo.estado} />
                      </div>
                      <p className="mt-1 text-sm text-stone-800">
                        {vehiculo.marca} {vehiculo.modelo} · {vehiculo.anio}
                      </p>
                      <p className="text-sm text-stone-600">
                        {ETIQUETA_TIPO[vehiculo.tipo]}
                        {vehiculo.numeroInterno && ` · N.º interno ${vehiculo.numeroInterno}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla (con el menú lateral, la tabla necesita una pantalla ancha) */}
              <div className={`${TARJETA} mt-4 hidden overflow-hidden lg:block`}>
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
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
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {vehiculos.map((vehiculo) => (
                      <tr key={vehiculo.id} className="transition-colors hover:bg-orange-50/60">
                        <td className={`px-4 py-3 font-mono ${BARRA_ESTADO[TONOS[vehiculo.estado]]}`}>
                          <span className={ETIQUETA_PATENTE}>{formatearPatente(vehiculo.patente)}</span>
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
                            className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-orange-800 hover:underline"
                            aria-label={`Ver o editar ${formatearPatente(vehiculo.patente)}`}
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
