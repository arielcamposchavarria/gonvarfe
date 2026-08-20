import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";

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
): Promise<IncidentLogWithGuard[]> {
  const logs = await deps.incidentLogRepository.findBySite(siteId);
  const sorted = [...logs].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return Promise.all(
    sorted.map(async (log) => {
      const guard = await deps.userRepository.findById(log.guardId);
      return { log, guardName: guard?.name ?? "Guarda desconocido" };
    }),
  );
}
