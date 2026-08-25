import { describe, expect, it } from "vitest";

import { listRoundsBySite } from "./list-rounds-by-site";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Round } from "@/domain/entities/round";
import type { ShiftSession } from "@/domain/entities/shift-session";

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  assignedSiteId: "site-1",
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

function createFakeUserRepository(users: GuardUser[]): UserRepository {
  return {
    async findAll() {
      return users;
    },
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async findByRole(role) {
      return users.filter((user) => user.role === role);
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
  };
}

function buildRound(overrides: Partial<Round>): Round {
  return {
    id: "round-1",
    shiftSessionId: "session-1",
    siteId: "site-1",
    sequence: 1,
    startedAt: new Date("2026-01-01T08:00:00Z"),
    status: "completed",
    completedAt: new Date("2026-01-01T09:00:00Z"),
    scans: [],
    ...overrides,
  };
}

function buildSession(overrides: Partial<ShiftSession>): ShiftSession {
  return {
    id: "session-1",
    guardId: GUARD.id,
    siteId: "site-1",
    startedAt: new Date("2026-01-01T08:00:00Z"),
    status: "completed",
    endedAt: null,
    ...overrides,
  };
}

describe("listRoundsBySite", () => {
  it("ordena los recorridos del sitio del más reciente (o en curso) al más antiguo, con el nombre del guarda", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await shiftSessionRepository.create(buildSession({}));
    await roundRepository.create(
      buildRound({ id: "round-1", sequence: 1, startedAt: new Date("2026-01-01T08:00:00Z") }),
    );
    await roundRepository.create(
      buildRound({
        id: "round-2",
        sequence: 2,
        startedAt: new Date("2026-01-01T09:00:00Z"),
        status: "in-progress",
        completedAt: null,
      }),
    );

    const result = await listRoundsBySite({ roundRepository, shiftSessionRepository, userRepository }, "site-1");

    expect(result.map((r) => r.round.id)).toEqual(["round-2", "round-1"]);
    expect(result[0].guardName).toBe("Ana Pérez");
  });

  it("no incluye recorridos de otros sitios", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await roundRepository.create(buildRound({ id: "round-other", siteId: "site-2" }));

    const result = await listRoundsBySite({ roundRepository, shiftSessionRepository, userRepository }, "site-1");

    expect(result).toEqual([]);
  });
});
