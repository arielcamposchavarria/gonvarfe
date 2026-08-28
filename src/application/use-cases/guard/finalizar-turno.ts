import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno } from "@/domain/entities/turno";

export interface FinalizarTurnoDeps {
  turnoRepository: TurnoRepository;
}

export class NoActiveTurnoError extends Error {
  constructor() {
    super("No hay un turno activo para finalizar.");
    this.name = "NoActiveTurnoError";
  }
}

/**
 * El endpoint del backend es PATCH /turnos/:id/finalizar (exige el id del
 * turno), así que primero se resuelve cuál es el turno activo del guard.
 */
export async function finalizarTurno({ turnoRepository }: FinalizarTurnoDeps): Promise<Turno> {
  const activo = await turnoRepository.activo();
  if (!activo) throw new NoActiveTurnoError();
  return turnoRepository.finalizar(activo.id);
}
