import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListIncidentLogsBySiteDeps {
  incidentLogRepository: IncidentLogRepository;
  userRepository: UserRepository;
}

export interface IncidentLogWithGuard {
  log: IncidentLog;
  guardName: string;
}

/** Bitácora de incidencias de un sitio, de la más reciente a la más antigua. */
export async function listIncidentLogsBySite(
  deps: ListIncidentLogsBySiteDeps,
  siteId: string,
  range: DateRange = {},
): Promise<IncidentLogWithGuard[]> {
  const logs = await deps.incidentLogRepository.findBySite(siteId);
  const sorted = [...logs]
    .filter((log) => isWithinDateRange(log.occurredAt, range))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return Promise.all(
    sorted.map(async (log) => {
      const guard = await deps.userRepository.findById(log.guardId);
      return { log, guardName: guard?.name ?? "Guarda desconocido" };
    }),
  );
}
