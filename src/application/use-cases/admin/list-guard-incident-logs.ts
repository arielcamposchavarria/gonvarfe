import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardIncidentLogsDeps {
  incidentLogRepository: IncidentLogRepository;
  sitioRepository: SitioRepository;
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
  const sitios = await deps.sitioRepository.findAll();
  const siteNameById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return [...logs]
    .filter((log) => isWithinDateRange(log.occurredAt, range))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((log) => ({ log, siteName: siteNameById.get(log.sitioId) ?? log.sitioId }));
}
