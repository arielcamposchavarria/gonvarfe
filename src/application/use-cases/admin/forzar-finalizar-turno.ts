import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno } from "@/domain/entities/turno";

export interface ForzarFinalizarTurnoDeps {
  turnoRepository: TurnoRepository;
}

/** El admin cierra el turno de un guardia aunque tenga un recorrido en progreso sin escanear todas las marcas. */
export async function forzarFinalizarTurno(
  { turnoRepository }: ForzarFinalizarTurnoDeps,
  turnoId: string,
): Promise<Turno> {
  return turnoRepository.forzarFinalizar(turnoId);
}
