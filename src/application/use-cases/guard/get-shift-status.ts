import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { ShiftSession } from "@/domain/entities/shift-session";
import type { Round } from "@/domain/entities/round";
import type { Site } from "@/domain/entities/site";

export interface GetShiftStatusDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
}

export interface ShiftStatus {
  site: Site;
  session: ShiftSession | null;
  activeRound: Round | null;
  completedRoundsCount: number;
}

export async function getShiftStatus(deps: GetShiftStatusDeps, siteId: string, guardId: string): Promise<ShiftStatus> {
  const site = await deps.siteRepository.findById(siteId);
  if (!site) throw new Error(`No se encontró el sitio "${siteId}".`);

  const session = await deps.shiftSessionRepository.findActiveByGuard(guardId);
  if (!session) {
    return { site, session: null, activeRound: null, completedRoundsCount: 0 };
  }

  const rounds = await deps.roundRepository.findByShiftSession(session.id);
  const activeRound = rounds.find((round) => round.status === "in-progress") ?? null;
  const completedRoundsCount = rounds.filter((round) => round.status === "completed").length;

  return { site, session, activeRound, completedRoundsCount };
}
