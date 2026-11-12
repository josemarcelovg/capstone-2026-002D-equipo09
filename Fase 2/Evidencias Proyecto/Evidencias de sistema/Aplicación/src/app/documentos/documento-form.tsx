"use client";

import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  DUENOS_POR_TIPO,
  ETIQUETA_TIPO_DOCUMENTO,
  fichaDelDueno,
  TIPOS_DOCUMENTO,
  tiposPara,
  validarDocumento,
  type Documento,
  type DuenoDocumento,
  type Origen,
  type TipoDocumento,
  type TipoDueno,
} from "@/lib/documentos";
import { formatearFecha, hoyEnChile } from "@/lib/fechas";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
import { guardarDocumento, type ErroresGuardado } from "./acciones";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL } from "../estilos";


/** Un vehículo o conductor que se puede elegir como dueño. */
export type OpcionDueno = { id: string; nombre: string };

function Campo({
  nombre,
  etiqueta,
  error,
  ayuda,
  opcional = false,
  children,
}: {
  nombre: string;
  etiqueta: string;
  error?: ReactNode;
  ayuda?: string;
  opcional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={nombre} className="text-sm font-medium text-stone-800">
        {etiqueta}
        {opcional && <span className="font-normal text-stone-500"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${nombre}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${nombre}-ayuda`} className="mt-1 text-xs text-stone-600">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

const EJEMPLO_DESCRIPCION: Partial<Record<TipoDocumento, string>> = {
  licencia_conducir: "Clase A3",
  otro: "Seguro de pasajeros",
};

/**
 * Formulario de registro (sin `documento`) y de edición (con `documento`). El tipo decide si el
 * dueño es un vehículo o un conductor (JOA-10, sección 3.1). Al editar, o al llegar desde una
 * ficha (`duenoFijo`), el dueño solo puede ser del mismo tipo: de vehículo a vehículo o de
 * conductor a conductor.
 */
export function DocumentoForm({
  documento,
  duenoFijo,
  vehiculos,
  conductores,
  origen,
}: {
  documento?: Documento;
  duenoFijo?: Pick<DuenoDocumento, "tipo" | "id">;
  vehiculos: OpcionDueno[];
  conductores: OpcionDueno[];
  origen: Origen;
}) {
  const [errores, setErrores] = useState<ErroresGuardado>({});
  const [guardando, iniciarGuardado] = useTransition();

  const bloqueado: TipoDueno | undefined = documento?.dueno.tipo ?? duenoFijo?.tipo;
  const tipos = bloqueado ? tiposPara(bloqueado) : TIPOS_DOCUMENTO;
  const [tipo, setTipo] = useState<TipoDocumento | "">(documento?.tipo ?? "");
  const [elegido, setElegido] = useState<TipoDueno | "">(bloqueado ?? "");

  // Con un tipo de un solo dueño, el dueño queda decidido; con "otro" lo elige el usuario.
  const posibles = tipo ? DUENOS_POR_TIPO[tipo] : [];
  const tipoDueno: TipoDueno | null =
    bloqueado ?? (posibles.length === 1 ? posibles[0] : elegido || null);
  const campoDueno = tipoDueno === "vehiculo" ? "vehiculoId" : tipoDueno === "conductor" ? "conductorId" : null;
  const opciones = tipoDueno === "vehiculo" ? vehiculos : conductores;
  const duenoInicial = documento?.dueno ?? duenoFijo;
  const volverA = origen === "ficha" && duenoInicial ? fichaDelDueno(duenoInicial) : "/documentos";

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const mostrar = (nuevos: ErroresGuardado) => {
      setErrores(nuevos);
      const campo = Object.keys(nuevos)[0];
      const nombre = campo === "dueno" ? (campoDueno ?? "duenoTipo") : campo;
      const elemento = formulario.elements.namedItem(nombre);
      const enfocable = elemento instanceof RadioNodeList ? elemento[0] : elemento;
      if (enfocable instanceof HTMLElement) enfocable.focus();
    };

    // Primero en el navegador para ayudar al usuario; el servidor valida de nuevo.
    const resultado = validarDocumento(Object.fromEntries(datos), hoyEnChile());
    if (!resultado.ok) return mostrar(resultado.errores);

    iniciarGuardado(async () => {
      const delServidor = await llamarAlServidor(
        () => guardarDocumento(documento?.id ?? null, origen, datos),
        { general: SIN_CONEXION },
        unstable_rethrow,
      );
      if (delServidor) mostrar(delServidor);
    });
  }

  const describir = (nombre: string, error: unknown, ayuda?: boolean) =>
    error ? `${nombre}-error` : ayuda ? `${nombre}-ayuda` : undefined;

  const errorTipo = errores.tipo && (
    <>
      {errores.tipo}
      {errores.repetidoId && (
        <>
          {" "}
          <Link href={`/documentos/${errores.repetidoId}?volver=${origen}`} className="font-medium underline">
            Ir a editarlo
          </Link>
        </>
      )}
    </>
  );
  const errorDueno = (campoDueno && errores[campoDueno]) || errores.dueno;

  return (
    <form onSubmit={enviar} noValidate className="rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="tipo" etiqueta="Tipo de documento" error={errorTipo}>
          <select
            id="tipo"
            name="tipo"
            className={CONTROL}
            value={tipo}
            onChange={(evento) => {
              setTipo(evento.target.value as TipoDocumento | "");
              setErrores((anteriores) => ({
                ...anteriores,
                tipo: undefined,
                dueno: undefined,
                repetidoId: undefined,
              }));
            }}
            aria-invalid={Boolean(errores.tipo)}
            aria-describedby={describir("tipo", errores.tipo)}
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map((valor) => (
              <option key={valor} value={valor}>
                {ETIQUETA_TIPO_DOCUMENTO[valor]}
              </option>
            ))}
          </select>
        </Campo>

        <div className="grid gap-3">
          {!bloqueado && tipo === "otro" && (
            <fieldset aria-describedby={!campoDueno && errores.dueno ? "dueno-error" : undefined}>
              <legend className="text-sm font-medium text-stone-800">¿De quién es el documento?</legend>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {(["vehiculo", "conductor"] as const).map((valor) => (
                  <label key={valor} className="flex items-center gap-2 text-sm text-stone-800">
                    <input
                      type="radio"
                      name="duenoTipo"
                      value={valor}
                      checked={elegido === valor}
                      onChange={() => setElegido(valor)}
                      className="size-4 accent-orange-700"
                    />
                    {valor === "vehiculo" ? "De un vehículo" : "De un conductor"}
                  </label>
                ))}
              </div>
              {!campoDueno && errores.dueno && (
                <p id="dueno-error" className="mt-1 text-sm text-red-700">
                  {errores.dueno}
                </p>
              )}
            </fieldset>
          )}

          {campoDueno && (
            <Campo
              nombre={campoDueno}
              etiqueta={tipoDueno === "vehiculo" ? "Vehículo" : "Conductor"}
              error={errorDueno}
              ayuda={
                opciones.length === 0
                  ? tipoDueno === "vehiculo"
                    ? "No tienes vehículos activos. Registra uno primero."
                    : "No tienes conductores activos. Registra uno primero."
                  : undefined
              }
            >
              <select
                // Al pasar de vehículo a conductor se crea otro campo, con su propio valor.
                key={campoDueno}
                id={campoDueno}
                name={campoDueno}
                className={CONTROL}
                defaultValue={duenoInicial?.tipo === tipoDueno ? duenoInicial.id : ""}
                aria-invalid={Boolean(errorDueno)}
                aria-describedby={describir(campoDueno, errorDueno, opciones.length === 0)}
              >
                <option value="">
                  {tipoDueno === "vehiculo" ? "Selecciona un vehículo" : "Selecciona un conductor"}
                </option>
                {opciones.map((opcion) => (
                  <option key={opcion.id} value={opcion.id}>
                    {opcion.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </div>

        <Campo
          nombre="descripcion"
          etiqueta="Descripción"
          error={errores.descripcion}
          opcional={tipo !== "otro"}
        >
          <input
            id="descripcion"
            name="descripcion"
            className={CONTROL}
            defaultValue={documento?.descripcion ?? ""}
            placeholder={(tipo && EJEMPLO_DESCRIPCION[tipo]) || ""}
            maxLength={100}
            autoComplete="off"
            aria-invalid={Boolean(errores.descripcion)}
            aria-describedby={describir("descripcion", errores.descripcion)}
          />
        </Campo>

        <Campo
          nombre="fechaVencimiento"
          etiqueta="Fecha de vencimiento"
          error={errores.fechaVencimiento}
          ayuda="El último día válido, en formato DD-MM-AAAA."
        >
          <input
            id="fechaVencimiento"
            name="fechaVencimiento"
            className={CONTROL}
            defaultValue={documento ? formatearFecha(documento.fechaVencimiento) : ""}
            placeholder="DD-MM-AAAA"
            maxLength={10}
            autoComplete="off"
            aria-invalid={Boolean(errores.fechaVencimiento)}
            aria-describedby={describir("fechaVencimiento", errores.fechaVencimiento, true)}
          />
        </Campo>

        <div className="sm:col-span-2">
          <Campo nombre="observaciones" etiqueta="Observaciones" error={errores.observaciones} opcional>
            <textarea
              id="observaciones"
              name="observaciones"
              className={CONTROL}
              defaultValue={documento?.observaciones ?? ""}
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(errores.observaciones)}
              aria-describedby={describir("observaciones", errores.observaciones)}
            />
          </Campo>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={volverA}
          className={BOTON_SECUNDARIO}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={guardando}
          className={BOTON_PRINCIPAL}
        >
          {guardando ? "Guardando…" : documento ? "Guardar cambios" : "Registrar documento"}
        </button>
      </div>
    </form>
  );
}
