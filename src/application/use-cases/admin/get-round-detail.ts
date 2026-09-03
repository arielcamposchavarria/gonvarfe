import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Sitio } from "@/domain/entities/sitio";

export interface GetRoundDetailDeps {
  recorridoRepository: RecorridoRepository;
  turnoRepository: TurnoRepository;
  sitioRepository: SitioRepository;
  userRepository: UserRepository;
}

export interface RoundDetail {
  recorrido: Recorrido;
  guardName: string;
  sitio: Sitio;
  /** Turno al que pertenece este recorrido — null solo si el turno ya no existe (dato huérfano). */
  turnoId: string;
  turnoIniciadoEn: Date | null;
}

export async function getRoundDetail(
  deps: GetRoundDetailDeps,
  siteId: string,
  roundId: string,
): Promise<RoundDetail | null> {
  const recorrido = await deps.recorridoRepository.porId(roundId);
  if (!recorrido || recorrido.sitioId !== siteId) return null;

  const sitio = await deps.sitioRepository.findById(siteId);
  if (!sitio) return null;

  const turnos = await deps.turnoRepository.porSitio(siteId);
  const turno = turnos.find((t) => t.id === recorrido.turnoId) ?? null;
  const guard = turno ? await deps.userRepository.findById(turno.guardiaId) : null;

  return {
    recorrido,
    guardName: guard?.name ?? "Guarda desconocido",
    sitio,
    turnoId: recorrido.turnoId,
    turnoIniciadoEn: turno?.iniciadoEn ?? null,
  };
}
