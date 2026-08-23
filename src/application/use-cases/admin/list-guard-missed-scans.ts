import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardMissedScansDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
}

export interface MissedScanEntry {
  siteName: string;
  stationName: string;
  roundSequence: number;
  reason: string;
  reportedAt: Date;
}

/** Estaciones que el guard no pudo escanear, con el motivo reportado, de la más reciente a la más antigua. */
export async function listGuardMissedScans(
  deps: ListGuardMissedScansDeps,
  guardId: string,
  range: DateRange = {},
): Promise<MissedScanEntry[]> {
  const sessions = await deps.shiftSessionRepository.findByGuard(guardId);
  const roundsBySession = await Promise.all(
    sessions.map((session) => deps.roundRepository.findByShiftSession(session.id)),
  );
  const rounds = roundsBySession.flat();

  const sites = await deps.siteRepository.findAll();
  const siteById = new Map(sites.map((site) => [site.id, site]));

  const entries: MissedScanEntry[] = [];
  for (const round of rounds) {
    const site = siteById.get(round.siteId);
    const stationById = new Map((site?.stations ?? []).map((station) => [station.id, station]));

    for (const scan of round.scans) {
      if (scan.status !== "missed" || !scan.missedReport) continue;
      if (!isWithinDateRange(scan.missedReport.reportedAt, range)) continue;
      const station = stationById.get(scan.stationId);
      entries.push({
        siteName: site?.name ?? round.siteId,
        stationName: station?.name ?? scan.stationId,
        roundSequence: round.sequence,
        reason: scan.missedReport.reason,
        reportedAt: scan.missedReport.reportedAt,
      });
    }
  }

  return entries.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
}
