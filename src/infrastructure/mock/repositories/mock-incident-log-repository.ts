import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";

export function createMockIncidentLogRepository(): IncidentLogRepository {
  const logs: IncidentLog[] = [];

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
