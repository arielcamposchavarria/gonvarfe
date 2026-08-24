import type { Site } from "@/domain/entities/site";
import type { Round } from "@/domain/entities/round";
import type { StationScan } from "@/domain/entities/station-scan";
import { createTimeWindow } from "@/domain/value-objects/time-window";
import { ROUND_DURATION_MINUTES, MAX_STATION_WINDOW_MINUTES } from "@/domain/constants";

/**
 * Crea un recorrido nuevo repartiendo la hora entre las estaciones del sitio,
 * limitando la ventana de cada estación a MAX_STATION_WINDOW_MINUTES.
 */
export function buildRound(params: {
  id: string;
  shiftSessionId: string;
  site: Site;
  sequence: number;
  startedAt: Date;
}): Round {
  const stations = [...params.site.stations].sort((a, b) => a.order - b.order);
  const stationWindowMinutes = Math.min(ROUND_DURATION_MINUTES / stations.length, MAX_STATION_WINDOW_MINUTES);

  const scans: StationScan[] = stations.map((station, index) => ({
    id: crypto.randomUUID(),
    roundId: params.id,
    stationId: station.id,
    order: station.order,
    window: createTimeWindow(
      new Date(params.startedAt.getTime() + index * stationWindowMinutes * 60_000),
      stationWindowMinutes,
    ),
    status: "pending",
    scannedAt: null,
    missedReport: null,
  }));

  return {
    id: params.id,
    shiftSessionId: params.shiftSessionId,
    siteId: params.site.id,
    sequence: params.sequence,
    startedAt: params.startedAt,
    status: "in-progress",
    completedAt: null,
    scans,
  };
}
