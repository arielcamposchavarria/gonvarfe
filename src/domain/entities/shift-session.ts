export type ShiftSessionStatus = "active" | "completed";

/** Desde que el guard escanea el QR de inicio hasta que escanea el QR de salida. */
export interface ShiftSession {
  readonly id: string;
  readonly guardId: string;
  readonly siteId: string;
  readonly startedAt: Date;
  status: ShiftSessionStatus;
  endedAt: Date | null;
}
