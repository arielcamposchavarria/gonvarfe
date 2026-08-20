import type { UserRepository } from "@/domain/ports/user-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Site } from "@/domain/entities/site";

export interface GetGuardDetailDeps {
  userRepository: UserRepository;
  siteRepository: SiteRepository;
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  entryLogRepository: EntryLogRepository;
  incidentLogRepository: IncidentLogRepository;
}

export interface GuardDetail {
  guard: GuardUser;
  assignedSite: Site;
  /** Sitio donde está el guard ahora mismo, o null si no tiene una jornada activa. */
  currentSite: Site | null;
  totals: {
    scansOnTime: number;
    scansMissed: number;
    roundsCompleted: number;
    entryLogsCount: number;
    incidentLogsCount: number;
  };
}

export async function getGuardDetail(deps: GetGuardDetailDeps, guardId: string): Promise<GuardDetail | null> {
  const guard = await deps.userRepository.findById(guardId);
  if (!guard || guard.role !== "guard") return null;

  const assignedSite = await deps.siteRepository.findById(guard.assignedSiteId);
  if (!assignedSite) return null;

  const activeSession = await deps.shiftSessionRepository.findActiveByGuard(guard.id);
  const currentSite = activeSession ? await deps.siteRepository.findById(activeSession.siteId) : null;

  const sessions = await deps.shiftSessionRepository.findByGuard(guard.id);
  const roundsBySession = await Promise.all(
    sessions.map((session) => deps.roundRepository.findByShiftSession(session.id)),
  );
  const rounds = roundsBySession.flat();
  const scans = rounds.flatMap((round) => round.scans);

  const [entryLogs, incidentLogs] = await Promise.all([
    deps.entryLogRepository.findByGuard(guard.id),
    deps.incidentLogRepository.findByGuard(guard.id),
  ]);

  return {
    guard,
    assignedSite,
    currentSite,
    totals: {
      scansOnTime: scans.filter((scan) => scan.status === "on-time").length,
      scansMissed: scans.filter((scan) => scan.status === "missed").length,
      roundsCompleted: rounds.filter((round) => round.status === "completed").length,
      entryLogsCount: entryLogs.length,
      incidentLogsCount: incidentLogs.length,
    },
  };
}
