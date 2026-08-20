import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import type { IncidentType } from "@/domain/value-objects/incident-type";

export interface SubmitIncidentLogDeps {
  incidentLogRepository: IncidentLogRepository;
}

export interface SubmitIncidentLogInput {
  siteId: string;
  guardId: string;
  incidentType: IncidentType;
  locationZone: string;
  description: string;
  photoUrls: string[];
}

export async function submitIncidentLog(
  deps: SubmitIncidentLogDeps,
  input: SubmitIncidentLogInput,
): Promise<IncidentLog> {
  const log: IncidentLog = {
    id: crypto.randomUUID(),
    siteId: input.siteId,
    guardId: input.guardId,
    occurredAt: new Date(),
    incidentType: input.incidentType,
    locationZone: input.locationZone,
    description: input.description,
    photoUrls: input.photoUrls,
    createdAt: new Date(),
  };
  return deps.incidentLogRepository.create(log);
}
