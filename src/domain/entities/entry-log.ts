import type { Cedula } from "../value-objects/cedula";
import type { PlateNumber } from "../value-objects/plate-number";

/** Bitácora de reportes de ingreso que llena el guard. */
export interface EntryLog {
  readonly id: string;
  readonly sitioId: string;
  readonly guardId: string;
  date: string;
  /** Generada por el servidor al crear el registro; el guard no la escribe. */
  entryTime: string;
  /** Null hasta que el guard registra la salida (endpoint separado). */
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
