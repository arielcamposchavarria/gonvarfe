import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";
import type { Cedula } from "@/domain/value-objects/cedula";
import type { PlateNumber } from "@/domain/value-objects/plate-number";

export interface SubmitEntryLogDeps {
  entryLogRepository: EntryLogRepository;
}

export interface SubmitEntryLogInput {
  sitioId: string;
  guardId: string;
  date: string;
  plate: PlateNumber;
  driverName: string;
  cedula: Cedula;
  company: string;
  reason: string;
  visitingLocal: string;
  observations: string;
  photoUrls: string[];
}

export async function submitEntryLog(deps: SubmitEntryLogDeps, input: SubmitEntryLogInput): Promise<EntryLog> {
  const log: EntryLog = {
    id: crypto.randomUUID(),
    sitioId: input.sitioId,
    guardId: input.guardId,
    date: input.date,
    // El servidor genera horaEntrada y deja horaSalida en null al crear;
    // estos valores se descartan y se reemplazan por la respuesta real.
    entryTime: "",
    exitTime: null,
    plate: input.plate,
    driverName: input.driverName,
    cedula: input.cedula,
    company: input.company,
    reason: input.reason,
    visitingLocal: input.visitingLocal,
    observations: input.observations,
    photoUrls: input.photoUrls,
    createdAt: new Date(),
  };
  return deps.entryLogRepository.create(log);
}
