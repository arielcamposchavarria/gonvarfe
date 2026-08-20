import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";

export interface ListGuardIncidentLogsDeps {
  incidentLogRepository: IncidentLogRepository;
  siteRepository: SiteRepository;
}

export interface IncidentLogWithSite {
  log: IncidentLog;
  siteName: string;
}

/** Bitácora de incidencias que reportó un guard, de la más reciente a la más antigua. */
export async function listGuardIncidentLogs(
  deps: ListGuardIncidentLogsDeps,
  guardId: string,
): Promise<IncidentLogWithSite[]> {
  const logs = await deps.incidentLogRepository.findByGuard(guardId);
  const sites = await deps.siteRepository.findAll();
  const siteNameById = new Map(sites.map((site) => [site.id, site.name]));

  return [...logs]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((log) => ({ log, siteName: siteNameById.get(log.siteId) ?? log.siteId }));
}
