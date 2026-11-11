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
import { Encabezado, MensajeExito } from "../../encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL, TARJETA } from "../../estilos";
import { IconoDocumento, IconoFlecha, IconoMas } from "../../iconos";
import { BARRA_ESTADO } from "../../insignia";
import { IconoEstadoDocumento, InsigniaVencimiento, tonoDocumento } from "../insignia-estado";

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
        className={`font-medium text-orange-800 hover:underline ${dueno.tipo === "vehiculo" ? "font-mono" : ""}`}
        aria-label={`${dueno.tipo === "vehiculo" ? "Vehículo" : "Conductor"} ${dueno.nombre}`}
      >
        {dueno.nombre}
      </Link>
      {!dueno.activo && <span className="text-stone-600"> (inactivo)</span>}
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
      <Encabezado
        titulo="Documentos"
        descripcion="Controla los vencimientos de los documentos de tus vehículos y conductores."
      >
        <Link href="/documentos/nuevo" className={BOTON_PRINCIPAL}>
          <IconoMas className="size-4" />
          Registrar documento
        </Link>
      </Encabezado>

      {mensaje && <MensajeExito>{mensaje}</MensajeExito>}

      {sinRegistros ? (
        <div className="mt-6 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-800">
            <IconoDocumento className="size-6" />
          </span>
          <p className="mt-3 font-medium text-stone-800">Aún no tienes documentos registrados</p>
          <Link href="/documentos/nuevo" className={`mt-4 ${BOTON_PRINCIPAL}`}>
            <IconoMas className="size-4" />
            Registrar documento
          </Link>
        </div>
      ) : (
        <>
          <Form
            action="/documentos"
            className={`${TARJETA} mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end`}
          >
            <div>
              <label htmlFor="estado" className="text-sm font-medium text-stone-800">
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
              <label htmlFor="tipo" className="text-sm font-medium text-stone-800">
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
                Filtrar
              </button>
              {(estado || tipo || incluirInactivos) && (
                <Link
                  href="/documentos"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-orange-800 hover:underline"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </Form>

          {documentos.length === 0 ? (
            <p className={`${TARJETA} mt-6 px-4 py-8 text-center text-stone-700`}>
              No hay documentos que coincidan con los filtros.
            </p>
          ) : (
            <>
              {/* Celular y tablet: una tarjeta por documento */}
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
                {documentos.map((documento) => (
                  <li
                    key={documento.id}
                    className={`${TARJETA} ${BARRA_ESTADO[tonoDocumento(documento.fechaVencimiento, hoy)]} p-4`}
                  >
                    <div className="flex items-center gap-3">
                      <IconoEstadoDocumento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                      <Link
                        href={`/documentos/${documento.id}`}
                        className="min-w-0 font-semibold break-words text-stone-900 hover:underline"
                      >
                        {nombreDelDocumento(documento)}
                      </Link>
                    </div>
                    <p className="mt-1 text-sm text-stone-700">
                      De <Dueno documento={documento} />
                    </p>
                    <p className="text-sm text-stone-600">Vence el {formatearFecha(documento.fechaVencimiento)}</p>
                    <div className="mt-2">
                      <InsigniaVencimiento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Computador: tabla (con el menú lateral, la tabla necesita una pantalla ancha) */}
              <div className={`${TARJETA} mt-4 hidden overflow-hidden lg:block`}>
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
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
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {documentos.map((documento) => (
                      <tr key={documento.id} className="transition-colors hover:bg-orange-50/60">
                        <td
                          className={`px-4 py-3 font-semibold break-words text-stone-900 ${BARRA_ESTADO[tonoDocumento(documento.fechaVencimiento, hoy)]}`}
                        >
                          <span className="flex items-center gap-3">
                            <IconoEstadoDocumento fechaVencimiento={documento.fechaVencimiento} hoy={hoy} />
                            {nombreDelDocumento(documento)}
                          </span>
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
                            className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-orange-800 hover:underline"
                            aria-label={`Ver / editar ${nombreDelDocumento(documento)} de ${documento.dueno.nombre}`}
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
