import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { ShiftSession } from "@/domain/entities/shift-session";

export function createMockShiftSessionRepository(): ShiftSessionRepository {
  const sessions = new Map<string, ShiftSession>();

  return {
    async findActiveByGuard(guardId) {
      for (const session of sessions.values()) {
        if (session.guardId === guardId && session.status === "active") return session;
      }
      return null;
    },
    async create(session) {
      sessions.set(session.id, session);
      return session;
    },
    async update(session) {
      sessions.set(session.id, session);
      return session;
    },
  };
}
