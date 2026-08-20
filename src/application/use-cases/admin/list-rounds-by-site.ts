import type { RoundRepository } from "@/domain/ports/round-repository";
import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { Round } from "@/domain/entities/round";

export interface ListRoundsBySiteDeps {
  roundRepository: RoundRepository;
  shiftSessionRepository: ShiftSessionRepository;
  userRepository: UserRepository;
}

export interface RoundWithGuard {
  round: Round;
  guardName: string;
}

/** Recorridos de un sitio, del más reciente (o en curso) al más antiguo. */
export async function listRoundsBySite(deps: ListRoundsBySiteDeps, siteId: string): Promise<RoundWithGuard[]> {
  const rounds = await deps.roundRepository.findBySite(siteId);
  const sorted = [...rounds].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  return Promise.all(
    sorted.map(async (round) => {
      const session = await deps.shiftSessionRepository.findById(round.shiftSessionId);
      const guard = session ? await deps.userRepository.findById(session.guardId) : null;
      return { round, guardName: guard?.name ?? "Guarda desconocido" };
    }),
  );
}
