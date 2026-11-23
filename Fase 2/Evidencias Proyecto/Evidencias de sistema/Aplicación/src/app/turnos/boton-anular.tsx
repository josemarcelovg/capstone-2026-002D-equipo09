"use client";

import { unstable_rethrow } from "next/navigation";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
import { BOTON_SECUNDARIO, CONTROL } from "../estilos";
import { anularDesdePantalla } from "./acciones";

const BOTON_ANULAR =
  "rounded-lg border border-red-700 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60";

// Pide confirmación y un motivo opcional antes de anular el turno.
export function BotonAnular({ id, pregunta }: { id: string; pregunta: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const titulo = useId();
  const [anulando, iniciarAnulacion] = useTransition();
  const [error, setError] = useState<string>();

  function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const motivo = String(new FormData(evento.currentTarget).get("motivo") ?? "");
    iniciarAnulacion(async () =>
      setError(await llamarAlServidor(() => anularDesdePantalla(id, motivo), SIN_CONEXION, unstable_rethrow)),
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className={`w-full sm:w-auto ${BOTON_ANULAR}`}
      >
        Anular turno
      </button>
      <dialog
        ref={dialogo}
        aria-labelledby={titulo}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-4 shadow-lg backdrop:bg-stone-900/50 sm:p-6"
      >
        <form onSubmit={confirmar}>
          <p id={titulo} className="font-semibold text-stone-900">
            {pregunta}
          </p>
          <label htmlFor="motivo" className="mt-4 block text-sm font-medium text-stone-800">
            Motivo <span className="font-normal text-stone-500">(opcional)</span>
          </label>
          <textarea id="motivo" name="motivo" rows={3} maxLength={200} className={CONTROL} />
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => dialogo.current?.close()} className={BOTON_SECUNDARIO}>
              Volver
            </button>
            <button type="submit" disabled={anulando} className={BOTON_ANULAR}>
              {anulando ? "Anulando…" : "Anular turno"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
