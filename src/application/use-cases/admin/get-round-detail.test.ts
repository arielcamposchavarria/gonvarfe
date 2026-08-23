import { describe, expect, it } from "vitest";

import { getRoundDetail } from "./get-round-detail";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Round } from "@/domain/entities/round";
import type { ShiftSession } from "@/domain/entities/shift-session";
import type { Site } from "@/domain/entities/site";

const SITE: Site = {
  id: "site-1",
  name: "Sitio de prueba",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start",
  exitQrCodeId: "qr-exit",
  stations: [],
  visitingLocals: [],
};

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  assignedSiteId: SITE.id,
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

function createFakeSiteRepository(sites: Site[]): SiteRepository {
  return {
    async findAll() {
      return sites;
    },
    async findById(id) {
      return sites.find((site) => site.id === id) ?? null;
    },
    async create(site) {
      return site;
    },
    async addVisitingLocal() {
      return null;
    },
  };
}

function createFakeUserRepository(users: GuardUser[]): UserRepository {
  return {
    async findAll() {
      return users;
    },
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async findByUsername(username) {
      return users.find((user) => user.username === username) ?? null;
    },
    async findByRole(role) {
      return users.filter((user) => user.role === role);
    },
    async create(user) {
      return user;
    },
  };
}

const ROUND: Round = {
  id: "round-1",
  shiftSessionId: "session-1",
  siteId: SITE.id,
  sequence: 1,
  startedAt: new Date("2026-01-01T08:00:00Z"),
  status: "completed",
  completedAt: new Date("2026-01-01T09:00:00Z"),
  scans: [],
};

const SESSION: ShiftSession = {
  id: "session-1",
  guardId: GUARD.id,
  siteId: SITE.id,
  startedAt: new Date("2026-01-01T08:00:00Z"),
  status: "completed",
  endedAt: new Date("2026-01-01T09:00:00Z"),
};

describe("getRoundDetail", () => {
  it("devuelve el recorrido, el sitio y el nombre del guarda responsable", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);
    const userRepository = createFakeUserRepository([GUARD]);

    await roundRepository.create(ROUND);
    await shiftSessionRepository.create(SESSION);

    const detail = await getRoundDetail(
      { roundRepository, shiftSessionRepository, siteRepository, userRepository },
      SITE.id,
      ROUND.id,
    );

    expect(detail?.round.id).toBe(ROUND.id);
    expect(detail?.site.id).toBe(SITE.id);
    expect(detail?.guardName).toBe("Ana Pérez");
  });

  it("devuelve null si el recorrido no existe o pertenece a otro sitio", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);
    const userRepository = createFakeUserRepository([GUARD]);

    await roundRepository.create(ROUND);

    await expect(
      getRoundDetail({ roundRepository, shiftSessionRepository, siteRepository, userRepository }, "site-2", ROUND.id),
    ).resolves.toBeNull();

    await expect(
      getRoundDetail(
        { roundRepository, shiftSessionRepository, siteRepository, userRepository },
        SITE.id,
        "round-missing",
      ),
    ).resolves.toBeNull();
  });
});
