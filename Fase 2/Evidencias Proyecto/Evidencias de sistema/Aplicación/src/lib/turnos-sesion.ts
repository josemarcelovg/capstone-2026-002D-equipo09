import { contextoDeLaSesion } from "@/lib/sesion";
import type { ContextoTurnos } from "@/lib/turnos-datos";

// Base, empresa de la sesión y fecha de hoy en Chile para las funciones de turnos-datos.ts.
// Por ejemplo: crearTurno(await contextoDeTurnos(), datos).
export async function contextoDeTurnos(): Promise<ContextoTurnos> {
  return contextoDeLaSesion();
}
