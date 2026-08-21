import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

export interface ListGuardEntryLogsDeps {
  entryLogRepository: EntryLogRepository;
  siteRepository: SiteRepository;
}

export interface EntryLogWithSite {
  log: EntryLog;
  siteName: string;
}

/** Bitácora de ingresos que llenó un guard, de la más reciente a la más antigua. */
export async function listGuardEntryLogs(deps: ListGuardEntryLogsDeps, guardId: string): Promise<EntryLogWithSite[]> {
  const logs = await deps.entryLogRepository.findByGuard(guardId);
  const sites = await deps.siteRepository.findAll();
  const siteNameById = new Map(sites.map((site) => [site.id, site.name]));

  return [...logs]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((log) => ({ log, siteName: siteNameById.get(log.siteId) ?? log.siteId }));
}
