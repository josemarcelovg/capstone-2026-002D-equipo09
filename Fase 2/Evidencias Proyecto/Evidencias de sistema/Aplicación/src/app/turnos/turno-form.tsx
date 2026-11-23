"use client";

import Link from "next/link";
import { unstable_rethrow, usePathname, useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { llamarAlServidor, SIN_CONEXION } from "@/lib/guardado";
import {
  ETIQUETA_JORNADA,
  JORNADAS,
  rangoDeFechasTurno,
  validarTurno,
  type DatosTurno,
  type ErroresTurno,
  type Jornada,
} from "@/lib/turnos";
import type { OpcionesTurno } from "@/lib/turnos-datos";
import { formatearPatente } from "@/lib/vehiculos";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, CONTROL } from "../estilos";
import { guardarTurno } from "./acciones";

function Campo({
  nombre,
  etiqueta,
  error,
  children,
}: {
  nombre: string;
  etiqueta: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={nombre} className="text-sm font-medium text-stone-800">
        {etiqueta}
      </label>
      {children}
      {error && (
        <p id={`${nombre}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// Texto que acompaña a cada opción: si no está activo o si ya tiene turno en esa fecha y jornada.
const notas = (activo: boolean, ocupado: boolean, inactivo: string) =>
  `${activo ? "" : ` · ${inactivo}`}${ocupado ? " · Ya tiene turno" : ""}`;

// Formulario para asignar o editar un turno.
export function TurnoForm({
  turnoId,
  hoy,
  fecha,
  jornada,
  vehiculoId = "",
  conductorId = "",
  opciones,
}: {
  turnoId?: string;
  hoy: string;
  fecha: string;
  jornada?: Jornada;
  vehiculoId?: string;
  conductorId?: string;
  opciones: OpcionesTurno;
}) {
  const [errores, setErrores] = useState<ErroresTurno>({});
  const [guardando, iniciarGuardado] = useTransition();
  const [, iniciarConsulta] = useTransition();
  const router = useRouter();
  const ruta = usePathname();
  const { minima, maxima } = rangoDeFechasTurno(hoy);

  // Al cambiar la fecha o la jornada, el servidor vuelve a decir quién ya tiene turno.
  function revisarOcupados(evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const datos = new FormData(evento.currentTarget.form ?? undefined);
    const [nuevaFecha, nuevaJornada] = [datos.get("fecha"), datos.get("jornada")];
    if (!nuevaFecha || !nuevaJornada) return;
    iniciarConsulta(() =>
      router.replace(`${ruta}?fecha=${nuevaFecha}&jornada=${nuevaJornada}`, { scroll: false }),
    );
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const mostrar = (nuevos: ErroresTurno) => {
      setErrores(nuevos);
      const primero = formulario.elements.namedItem(Object.keys(nuevos)[0]);
      if (primero instanceof HTMLElement) primero.focus();
    };

    // Se valida primero en el navegador; el servidor vuelve a validar.
    const resultado = validarTurno(Object.fromEntries(datos), hoy);
    if (!resultado.ok) return mostrar(resultado.errores);

    iniciarGuardado(async () => {
      const delServidor = await llamarAlServidor(
        () => guardarTurno(turnoId ?? null, datos),
        { general: SIN_CONEXION },
        unstable_rethrow,
      );
      if (delServidor) mostrar(delServidor);
    });
  }

  const control = (nombre: keyof DatosTurno) => ({
    id: nombre,
    name: nombre,
    className: CONTROL,
    "aria-invalid": Boolean(errores[nombre]),
    "aria-describedby": errores[nombre] ? `${nombre}-error` : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate className="rounded-xl border border-stone-200 bg-white shadow-sm p-4 sm:p-6">
      {errores.general && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800">
          {errores.general}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo nombre="fecha" etiqueta="Fecha" error={errores.fecha}>
          <input {...control("fecha")} type="date" defaultValue={fecha} min={minima} max={maxima} onChange={revisarOcupados} />
        </Campo>

        <Campo nombre="jornada" etiqueta="Jornada" error={errores.jornada}>
          <select {...control("jornada")} defaultValue={jornada ?? ""} onChange={revisarOcupados}>
            <option value="">Selecciona la jornada</option>
            {JORNADAS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETA_JORNADA[opcion]}
              </option>
            ))}
          </select>
        </Campo>

        <Campo nombre="vehiculoId" etiqueta="Vehículo" error={errores.vehiculoId}>
          <select {...control("vehiculoId")} defaultValue={vehiculoId}>
            <option value="">Selecciona el vehículo</option>
            {opciones.vehiculos.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {formatearPatente(vehiculo.patente)}
                {vehiculo.numeroInterno ? ` · N° ${vehiculo.numeroInterno}` : ""}
                {notas(vehiculo.activo, vehiculo.ocupado, "No activo")}
              </option>
            ))}
          </select>
        </Campo>

        <Campo nombre="conductorId" etiqueta="Conductor" error={errores.conductorId}>
          <select {...control("conductorId")} defaultValue={conductorId}>
            <option value="">Selecciona el conductor</option>
            {opciones.conductores.map((conductor) => (
              <option key={conductor.id} value={conductor.id}>
                {conductor.nombre}
                {notas(conductor.activo, conductor.ocupado, "Inactivo")}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/turnos?fecha=${fecha}`} className={BOTON_SECUNDARIO}>
          Cancelar
        </Link>
        <button type="submit" disabled={guardando} className={BOTON_PRINCIPAL}>
          {guardando ? "Guardando…" : turnoId ? "Guardar cambios" : "Asignar turno"}
        </button>
      </div>
    </form>
  );
}
