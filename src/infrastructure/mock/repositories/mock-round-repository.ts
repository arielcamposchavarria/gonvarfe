import type { RoundRepository } from "@/domain/ports/round-repository";
import type { Round } from "@/domain/entities/round";

export function createMockRoundRepository(): RoundRepository {
  const rounds = new Map<string, Round>();

  return {
    async findById(id) {
      return rounds.get(id) ?? null;
    },
    async findActiveByShiftSession(shiftSessionId) {
      for (const round of rounds.values()) {
        if (round.shiftSessionId === shiftSessionId && round.status === "in-progress") return round;
      }
      return null;
    },
    async findByShiftSession(shiftSessionId) {
      return [...rounds.values()]
        .filter((round) => round.shiftSessionId === shiftSessionId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async create(round) {
      rounds.set(round.id, round);
      return round;
    },
    async update(round) {
      rounds.set(round.id, round);
      return round;
    },
  };
}
