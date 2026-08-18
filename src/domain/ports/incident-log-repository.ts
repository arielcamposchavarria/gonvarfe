import type { IncidentLog } from "../entities/incident-log";

export interface IncidentLogRepository {
  findBySite(siteId: string): Promise<IncidentLog[]>;
  create(log: IncidentLog): Promise<IncidentLog>;
}
