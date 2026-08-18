import type { TimeWindow } from "../value-objects/time-window";
import type { MissedScanReport } from "./missed-scan-report";

export type StationScanStatus = "pending" | "on-time" | "missed";

export interface StationScan {
  readonly id: string;
  readonly roundId: string;
  readonly stationId: string;
  readonly order: number;
  readonly window: TimeWindow;
  status: StationScanStatus;
  scannedAt: Date | null;
  missedReport: MissedScanReport | null;
}
