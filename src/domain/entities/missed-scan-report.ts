export interface MissedScanReport {
  readonly id: string;
  readonly stationScanId: string;
  reason: string;
  readonly reportedAt: Date;
}
