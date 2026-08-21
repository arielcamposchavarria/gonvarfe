import type { EntryLog } from "../entities/entry-log";

export interface EntryLogRepository {
  findBySite(siteId: string): Promise<EntryLog[]>;
  findByGuard(guardId: string): Promise<EntryLog[]>;
  create(log: EntryLog): Promise<EntryLog>;
}
