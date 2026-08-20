import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

export interface ListEntryLogsBySiteDeps {
  entryLogRepository: EntryLogRepository;
  userRepository: UserRepository;
}

export interface EntryLogWithGuard {
  log: EntryLog;
  guardName: string;
}

/** Bitácora de ingresos de un sitio, de la más reciente a la más antigua. */
export async function listEntryLogsBySite(
  deps: ListEntryLogsBySiteDeps,
  siteId: string,
): Promise<EntryLogWithGuard[]> {
  const logs = await deps.entryLogRepository.findBySite(siteId);
  const sorted = [...logs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return Promise.all(
    sorted.map(async (log) => {
      const guard = await deps.userRepository.findById(log.guardId);
      return { log, guardName: guard?.name ?? "Guarda desconocido" };
    }),
  );
}
