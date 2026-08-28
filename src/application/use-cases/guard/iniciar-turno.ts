import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno } from "@/domain/entities/turno";

export interface IniciarTurnoDeps {
  turnoRepository: TurnoRepository;
}

/**
 * Inicia turno para el guard autenticado en el sitio elegido. El backend es
 * quien valida que no haya ya un turno activo y que el sitio exista y esté
 * activo (ver TurnoYaActivoException / SitioInactivoException).
 */
export async function iniciarTurno({ turnoRepository }: IniciarTurnoDeps, sitioId: string): Promise<Turno> {
  return turnoRepository.iniciar(sitioId);
}
