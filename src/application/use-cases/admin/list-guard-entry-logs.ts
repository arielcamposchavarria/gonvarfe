import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { EntryLog } from "@/domain/entities/entry-log";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardEntryLogsDeps {
  entryLogRepository: EntryLogRepository;
  sitioRepository: SitioRepository;
}

export interface EntryLogWithSite {
  log: EntryLog;
  siteName: string;
}

/** Bitácora de ingresos que llenó un guard, de la más reciente a la más antigua. */
export async function listGuardEntryLogs(
  deps: ListGuardEntryLogsDeps,
  guardId: string,
  range: DateRange = {},
): Promise<EntryLogWithSite[]> {
  const logs = await deps.entryLogRepository.findByGuard(guardId);
  const sitios = await deps.sitioRepository.findAll();
  const siteNameById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return [...logs]
    .filter((log) => isWithinDateRange(new Date(`${log.date}T00:00:00`), range))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((log) => ({ log, siteName: siteNameById.get(log.sitioId) ?? log.sitioId }));
}
