import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

export interface RegistrarSalidaEntryLogDeps {
  entryLogRepository: EntryLogRepository;
}

export async function registrarSalidaEntryLog(
  { entryLogRepository }: RegistrarSalidaEntryLogDeps,
  logId: string,
): Promise<EntryLog> {
  return entryLogRepository.registrarSalida(logId);
}
