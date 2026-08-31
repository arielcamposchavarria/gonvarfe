import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

export interface ListMyEntryLogsDeps {
  entryLogRepository: EntryLogRepository;
}

export async function listMyEntryLogs(
  { entryLogRepository }: ListMyEntryLogsDeps,
  guardId: string,
): Promise<EntryLog[]> {
  return entryLogRepository.findByGuard(guardId);
}
