import type { RoundRepository } from "@/domain/ports/round-repository";
import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { Round } from "@/domain/entities/round";
import type { Site } from "@/domain/entities/site";

export interface GetRoundDetailDeps {
  roundRepository: RoundRepository;
  shiftSessionRepository: ShiftSessionRepository;
  siteRepository: SiteRepository;
  userRepository: UserRepository;
}

export interface RoundDetail {
  round: Round;
  guardName: string;
  site: Site;
}

export async function getRoundDetail(
  deps: GetRoundDetailDeps,
  siteId: string,
  roundId: string,
): Promise<RoundDetail | null> {
  const round = await deps.roundRepository.findById(roundId);
  if (!round || round.siteId !== siteId) return null;

  const site = await deps.siteRepository.findById(siteId);
  if (!site) return null;

  const session = await deps.shiftSessionRepository.findById(round.shiftSessionId);
  const guard = session ? await deps.userRepository.findById(session.guardId) : null;

  return { round, guardName: guard?.name ?? "Guarda desconocido", site };
}
