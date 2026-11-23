import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { formatearFecha } from "@/lib/fechas";
import {
  ENLACES_RESUMEN,
  ETIQUETA_VEHICULOS,
  MENSAJES_RESUMEN,
  situacionDocumentos,
  textoVencenHoy,
} from "@/lib/resumen";
import { resumenDeLaFlota } from "@/lib/resumen-datos";
import { contextoDeLaSesion } from "@/lib/sesion";
import { ESTADOS } from "@/lib/vehiculos";
import { Encabezado } from "../encabezado";
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO, TARJETA } from "../estilos";
import { IconoBus, IconoDocumento, IconoFlecha, IconoMas, IconoReloj, IconoVigente } from "../iconos";
import { BARRA_ESTADO, type Tono } from "../insignia";
import { TONOS } from "../vehiculos/insignia-estado";

export const metadata: Metadata = { title: "Inicio" };

// Resumen de la flota (JOA-50): lo primero que se ve al entrar. Se calcula cada vez que se abre.
export default async function PaginaInicio() {
  const contexto = await contextoDeLaSesion();
  const { hoy } = contexto;
  const { vehiculos, documentos } = await resumenDeLaFlota(contexto);
  const situacion = situacionDocumentos(documentos);

  return (
    <>
      <Encabezado titulo="Resumen de la flota" descripcion={`Así está tu flota hoy, ${formatearFecha(hoy)}.`}>
        <Link href="/vehiculos/nuevo" className={BOTON_PRINCIPAL}>
          <IconoMas className="size-4" />
          Registrar vehículo
        </Link>
        <Link href="/documentos/nuevo" className={BOTON_SECUNDARIO}>
          <IconoMas className="size-4" />
          Registrar documento
        </Link>
      </Encabezado>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Bloque titulo="Vehículos" Icono={IconoBus}>
          {vehiculos.total === 0 ? (
            <SinDatos mensaje={MENSAJES_RESUMEN.sinVehiculos} href="/vehiculos/nuevo" boton="Registrar vehículo" />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {ESTADOS.map((estado) => (
                <Cifra
                  key={estado}
                  href={ENLACES_RESUMEN[estado]}
                  numero={vehiculos[estado]}
                  texto={ETIQUETA_VEHICULOS[estado]}
                  tono={TONOS[estado]}
                />
              ))}
              <Cifra href={ENLACES_RESUMEN.totalVehiculos} numero={vehiculos.total} texto="Total" />
            </ul>
          )}
        </Bloque>

        <Bloque titulo="Documentos" Icono={IconoDocumento}>
          {situacion === "sin-documentos" && (
            <SinDatos mensaje={MENSAJES_RESUMEN.sinDocumentos} href="/documentos/nuevo" boton="Registrar documento" />
          )}
          {situacion === "al-dia" && (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <p className="flex items-start gap-2 text-sm font-medium">
                <IconoVigente className="size-5 shrink-0" />
                {MENSAJES_RESUMEN.alDia}
              </p>
              <Link href="/documentos" className="text-sm font-medium text-orange-800 hover:underline">
                Ver documentos
              </Link>
            </div>
          )}
          {situacion === "con-avisos" && (
            <ul className="grid gap-3 sm:grid-cols-2">
              <Cifra href={ENLACES_RESUMEN.vencidos} numero={documentos.vencidos} texto="Vencidos" tono="rojo" />
              <Cifra
                href={ENLACES_RESUMEN.porVencer}
                numero={documentos.porVencer}
                texto="Por vencer"
                tono="amarillo"
                detalle={textoVencenHoy(documentos.vencenHoy)}
              />
            </ul>
          )}
        </Bloque>
      </div>
    </>
  );
}

function Bloque({
  titulo,
  Icono,
  children,
}: {
  titulo: string;
  Icono: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
        <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-800">
          <Icono className="size-5" />
        </span>
        {titulo}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Un número con el nombre del estado escrito, que lleva al listado ya filtrado.
function Cifra({
  href,
  numero,
  texto,
  tono,
  detalle,
}: {
  href: string;
  numero: number;
  texto: string;
  tono?: Tono;
  detalle?: string | null;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`${TARJETA} ${tono ? BARRA_ESTADO[tono] : ""} flex h-full items-center justify-between gap-3 p-4 transition-colors hover:bg-stone-50`}
      >
        <span className="min-w-0">
          <span className="block text-3xl font-bold tabular-nums text-stone-900">{numero}</span>
          <span className="block text-sm font-medium text-stone-700">{texto}</span>
          {detalle && (
            <span className="mt-1 flex items-center gap-1 text-sm font-medium text-amber-800">
              <IconoReloj className="size-4" />
              {detalle}
            </span>
          )}
        </span>
        <IconoFlecha className="size-4 shrink-0 text-stone-500" />
      </Link>
    </li>
  );
}

function SinDatos({ mensaje, href, boton }: { mensaje: string; href: string; boton: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-8 text-center">
      <p className="font-medium text-stone-800">{mensaje}</p>
      <Link href={href} className={`mt-4 ${BOTON_PRINCIPAL}`}>
        <IconoMas className="size-4" />
        {boton}
      </Link>
    </div>
  );
}
