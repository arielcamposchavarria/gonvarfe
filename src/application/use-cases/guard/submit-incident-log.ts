import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import type { IncidentType } from "@/domain/value-objects/incident-type";

export interface SubmitIncidentLogDeps {
  incidentLogRepository: IncidentLogRepository;
}

export interface SubmitIncidentLogInput {
  sitioId: string;
  guardId: string;
  incidentType: IncidentType;
  incidentTypeDetail: string | null;
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
    sitioId: input.sitioId,
    guardId: input.guardId,
    occurredAt: new Date(),
    incidentType: input.incidentType,
    incidentTypeDetail: input.incidentTypeDetail,
    locationZone: input.locationZone,
    description: input.description,
    photoUrls: input.photoUrls,
    createdAt: new Date(),
  };
  return deps.incidentLogRepository.create(log);
}
