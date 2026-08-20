import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Round } from "@/domain/entities/round";

export interface ListGuardRoundsDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
}

export interface RoundWithSite {
  round: Round;
  siteName: string;
}

/** Recorridos de un guard a través de todas sus jornadas, del más reciente (o en curso) al más antiguo. */
export async function listGuardRounds(deps: ListGuardRoundsDeps, guardId: string): Promise<RoundWithSite[]> {
  const sessions = await deps.shiftSessionRepository.findByGuard(guardId);
  const roundsBySession = await Promise.all(
    sessions.map((session) => deps.roundRepository.findByShiftSession(session.id)),
  );
  const rounds = roundsBySession.flat();

  const sites = await deps.siteRepository.findAll();
  const siteNameById = new Map(sites.map((site) => [site.id, site.name]));

  return [...rounds]
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .map((round) => ({ round, siteName: siteNameById.get(round.siteId) ?? round.siteId }));
}
