import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";

export interface ListGuardScannedStationsDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
}

export interface ScannedStationEntry {
  siteName: string;
  stationName: string;
  roundSequence: number;
  scannedAt: Date;
}

/** Estaciones que el guard escaneó a tiempo, de la más reciente a la más antigua. */
export async function listGuardScannedStations(
  deps: ListGuardScannedStationsDeps,
  guardId: string,
): Promise<ScannedStationEntry[]> {
  const sessions = await deps.shiftSessionRepository.findByGuard(guardId);
  const roundsBySession = await Promise.all(
    sessions.map((session) => deps.roundRepository.findByShiftSession(session.id)),
  );
  const rounds = roundsBySession.flat();

  const sites = await deps.siteRepository.findAll();
  const siteById = new Map(sites.map((site) => [site.id, site]));

  const entries: ScannedStationEntry[] = [];
  for (const round of rounds) {
    const site = siteById.get(round.siteId);
    const stationById = new Map((site?.stations ?? []).map((station) => [station.id, station]));

    for (const scan of round.scans) {
      if (scan.status !== "on-time" || !scan.scannedAt) continue;
      const station = stationById.get(scan.stationId);
      entries.push({
        siteName: site?.name ?? round.siteId,
        stationName: station?.name ?? scan.stationId,
        roundSequence: round.sequence,
        scannedAt: scan.scannedAt,
      });
    }
  }

  return entries.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
}
