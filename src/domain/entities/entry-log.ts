import type { Cedula } from "../value-objects/cedula";
import type { PlateNumber } from "../value-objects/plate-number";

/** Bitácora de reportes de ingreso que llena el guard. */
export interface EntryLog {
  readonly id: string;
  readonly siteId: string;
  readonly guardId: string;
  date: string;
  entryTime: string;
  exitTime: string | null;
  plate: PlateNumber;
  driverName: string;
  cedula: Cedula;
  company: string;
  reason: string;
  visitingLocal: string;
  observations: string;
  /** Máximo MAX_LOG_IMAGES, campo opcional. */
  photoUrls: string[];
  readonly createdAt: Date;
}
