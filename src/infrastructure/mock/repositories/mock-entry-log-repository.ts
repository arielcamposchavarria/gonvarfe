import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

export function createMockEntryLogRepository(): EntryLogRepository {
  const logs: EntryLog[] = [];

  return {
    async findBySite(siteId) {
      return logs.filter((log) => log.siteId === siteId);
    },
    async findByGuard(guardId) {
      return logs.filter((log) => log.guardId === guardId);
    },
    async create(log) {
      logs.push(log);
      return log;
    },
  };
}
