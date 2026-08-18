import type { StationScan } from "./station-scan";

export type RoundStatus = "in-progress" | "completed";

/** Una vuelta completa a las STATIONS_PER_SITE estaciones del sitio. */
export interface Round {
  readonly id: string;
  readonly shiftSessionId: string;
  readonly siteId: string;
  readonly sequence: number;
  readonly startedAt: Date;
  status: RoundStatus;
  completedAt: Date | null;
  scans: StationScan[];
}
