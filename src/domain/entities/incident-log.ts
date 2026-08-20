import type { IncidentType } from "../value-objects/incident-type";

/** Bitácora de incidencias u otras novedades importantes durante el turno. */
export interface IncidentLog {
  readonly id: string;
  readonly siteId: string;
  readonly guardId: string;
  occurredAt: Date;
  incidentType: IncidentType;
  locationZone: string;
  description: string;
  /** Máximo MAX_LOG_IMAGES, campo opcional. */
  photoUrls: string[];
  readonly createdAt: Date;
}
