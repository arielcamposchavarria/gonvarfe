import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

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
  range: DateRange = {},
): Promise<IncidentLogWithSite[]> {
  const logs = await deps.incidentLogRepository.findByGuard(guardId);
  const sites = await deps.siteRepository.findAll();
  const siteNameById = new Map(sites.map((site) => [site.id, site.name]));

  return [...logs]
    .filter((log) => isWithinDateRange(log.occurredAt, range))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((log) => ({ log, siteName: siteNameById.get(log.siteId) ?? log.siteId }));
}
