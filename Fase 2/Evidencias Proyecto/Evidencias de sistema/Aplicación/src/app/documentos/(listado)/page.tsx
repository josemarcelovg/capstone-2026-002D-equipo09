import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import {
  ESTADOS_DOCUMENTO,
  ETIQUETA_TIPO_DOCUMENTO,
  fichaDelDueno,
  nombreDelDocumento,
  TIPOS_DOCUMENTO,
  type Documento,
  type EstadoDocumento,
} from "@/lib/documentos";
import { hayDocumentos, listarDocumentos } from "@/lib/documentos-datos";
import { formatearFecha, hoyEnChile } from "@/lib/fechas";
import { InsigniaVencimiento } from "../insignia-estado";

export const metadata: Metadata = { title: "Documentos" };

const MENSAJES = new Map([
  ["creado", "Documento registrado correctamente."],
  ["actualizado", "Los cambios del documento se guardaron."],
]);

const FILTRO_ESTADO: Record<EstadoDocumento, string> = {
  vencido: "Vencidos",
  por_vencer: "Por vencer",
  vigente: "Vigentes",
};

const BOTON_PRINCIPAL =
  "rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800";
const CONTROL =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30";

const primero = (valor: string | string[] | undefined) =>
  (Array.isArray(valor) ? valor[0] : valor) ?? "";

/** El valor si es uno de la lista; si no (un enlace modificado a mano), ninguno. */
function deLaLista<T extends string>(lista: readonly T[], valor: string): T | undefined {
  return lista.find((opcion) => opcion === valor);
}

/** Patente o nombre, con enlace a su ficha. */
function Dueno({ documento }: { documento: Documento }) {
  const { dueno } = documento;
  return (
    <>
      <Link
        href={fichaDelDueno(dueno)}
        className={`font-medium text-blue-800 hover:underline ${dueno.tipo === "vehiculo" ? "font-mono" : ""}`}
        aria-label={`${dueno.tipo === "vehiculo" ? "Vehículo" : "Conductor"} ${dueno.nombre}`}
      >
        {dueno.nombre}
      </Link>
      {!dueno.activo && <span className="text-zinc-600"> (inactivo)</span>}
    </>
  );
}

export default async function PaginaDocumentos({ searchParams }: PageProps<"/documentos">) {
  const parametros = await searchParams;
  const estado = deLaLista(ESTADOS_DOCUMENTO, primero(parametros.estado));
  const tipo = deLaLista(TIPOS_DOCUMENTO, primero(parametros.tipo));
  const incluirInactivos = primero(parametros.inactivos) === "1";
  const mensaje = MENSAJES.get(primero(parametros.mensaje));
  const hoy = hoyEnChile();

  const documentos = await listarDocumentos({ estado, tipo, incluirInactivos });
  const sinRegistros = documentos.length === 0 && !(await hayDocumentos());

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Documentos</h1>
        <Link href="/documentos/nuevo" className={BOTON_PRINCIPAL}>
          Registrar documento
        </Link>
      </div>

      {mensaje && (
        <p role="status" className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {mensaje}
        </p>
      )}

      {sinRegistros ? (
        <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-12 text-center">
          <p className="text-zinc-700">Aún no tienes documentos registrados</p>
          <Link href="/documentos/nuevo" className={`mt-4 inline-block ${BOTON_PRINCIPAL}`}>
            Registrar documento
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/documentos"
            className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <div>
              <label htmlFor="estado" className="text-sm font-medium text-zinc-800">
                Estado
              </label>
              <select id="estado" name="estado" defaultValue={estado ?? ""} className={CONTROL}>
                <option value="">Todos</option>
                {ESTADOS_DOCUMENTO.map((valor) => (
                  <option key={valor} value={valor}>
                    {FILTRO_ESTADO[valor]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tipo" className="text-sm font-medium text-zinc-800">
                Tipo
              </label>
              <select id="tipo" name="tipo" defaultValue={tipo ?? ""} className={CONTROL}>
                <option value="">Todos los tipos</option>
                {TIPOS_DOCUMENTO.map((valor) => (
                  <option key={valor} value={valor}>
                    {ETIQUETA_TIPO_DOCUMENTO[valor]}
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
                Filtrar
              </button>
              {(estado || tipo || incluirInactivos) && (
                <Link
                  href="/documentos"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-blue-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {documentos.length === 0 ? (
            <p className="mt-6 rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-700">
              No hay documentos que coincidan con los filtros.
            </p>
          ) : (
            <>
              {/* Celular: una tarjeta por documento */}
              <ul className="mt-4 grid gap-3 sm:hidden">
                {documentos.map((documento) => (
                  <li key={documento.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <Link
                      href={`/documentos/${documento.id}`}
                      className="block font-semibold break-words text-zinc-900 hover:underline"
                    >
                      {nombreDelDocumento(documento)}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-700">
                      De <Dueno documento={documento} />
                    </p>
                    <p className="text-sm text-zinc-600">Vence el {formatearFecha(documento.fechaVencimiento)}</p>
                    <div className="mt-2">
                      <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla */}
              <div className="mt-4 hidden overflow-hidden rounded-lg border border-zinc-200 bg-white sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Documento</th>
                      <th scope="col" className="px-4 py-3 font-medium">Pertenece a</th>
                      <th scope="col" className="px-4 py-3 font-medium">Vence</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {documentos.map((documento) => (
                      <tr key={documento.id}>
                        <td className="px-4 py-3 font-semibold break-words text-zinc-900">
                          {nombreDelDocumento(documento)}
                        </td>
                        <td className="px-4 py-3">
                          <Dueno documento={documento} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatearFecha(documento.fechaVencimiento)}</td>
                        <td className="px-4 py-3">
                          <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/documentos/${documento.id}`}
                            className="font-medium whitespace-nowrap text-blue-800 hover:underline"
                            aria-label={`Ver / editar ${nombreDelDocumento(documento)} de ${documento.dueno.nombre}`}
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
