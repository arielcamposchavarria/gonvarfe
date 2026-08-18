import type { Site } from "@/domain/entities/site";
import type { Round } from "@/domain/entities/round";
import type { StationScan } from "@/domain/entities/station-scan";
import { createTimeWindow } from "@/domain/value-objects/time-window";
import { STATION_WINDOW_MINUTES } from "@/domain/constants";

/** Crea un recorrido nuevo con sus 4 ventanas de estación calculadas desde startedAt. */
export function buildRound(params: {
  id: string;
  shiftSessionId: string;
  site: Site;
  sequence: number;
  startedAt: Date;
}): Round {
  const stations = [...params.site.stations].sort((a, b) => a.order - b.order);

  const scans: StationScan[] = stations.map((station, index) => ({
    id: crypto.randomUUID(),
    roundId: params.id,
    stationId: station.id,
    order: station.order,
    window: createTimeWindow(
      new Date(params.startedAt.getTime() + index * STATION_WINDOW_MINUTES * 60_000),
      STATION_WINDOW_MINUTES,
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
