import { describe, expect, it } from "vitest";

import { listGuardRounds } from "./list-guard-rounds";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";
import type { Round } from "@/domain/entities/round";
import type { ShiftSession } from "@/domain/entities/shift-session";

const SITE_1: Site = {
  id: "site-1",
  name: "Plaza Amara",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start-1",
  exitQrCodeId: "qr-exit-1",
  stations: [],
  visitingLocals: [],
};

const SITE_2: Site = {
  id: "site-2",
  name: "Planta Industrial Norte",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start-2",
  exitQrCodeId: "qr-exit-2",
  stations: [],
  visitingLocals: [],
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

function buildRound(overrides: Partial<Round>): Round {
  return {
    id: "round-1",
    shiftSessionId: "session-1",
    siteId: SITE_1.id,
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
    guardId: "guard-1",
    siteId: SITE_1.id,
    startedAt: new Date("2026-01-01T08:00:00Z"),
    status: "completed",
    endedAt: new Date("2026-01-01T09:00:00Z"),
    ...overrides,
  };
}

describe("listGuardRounds", () => {
  it("junta los recorridos de todas las jornadas del guard, con el sitio de origen, del más reciente al más antiguo", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE_1, SITE_2]);

    await shiftSessionRepository.create(buildSession({ id: "session-1", siteId: SITE_1.id }));
    await roundRepository.create(
      buildRound({ id: "round-1", shiftSessionId: "session-1", siteId: SITE_1.id, startedAt: new Date("2026-01-01T08:00:00Z") }),
    );

    await shiftSessionRepository.create(buildSession({ id: "session-2", siteId: SITE_2.id }));
    await roundRepository.create(
      buildRound({ id: "round-2", shiftSessionId: "session-2", siteId: SITE_2.id, startedAt: new Date("2026-01-02T08:00:00Z") }),
    );

    const result = await listGuardRounds({ roundRepository, shiftSessionRepository, siteRepository }, "guard-1");

    expect(result.map((r) => r.round.id)).toEqual(["round-2", "round-1"]);
    expect(result[0].siteName).toBe("Planta Industrial Norte");
    expect(result[1].siteName).toBe("Plaza Amara");
  });

  it("no incluye recorridos de otros guardas", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE_1]);

    await shiftSessionRepository.create(buildSession({ id: "session-otro", guardId: "guard-otro" }));
    await roundRepository.create(buildRound({ shiftSessionId: "session-otro" }));

    const result = await listGuardRounds({ roundRepository, shiftSessionRepository, siteRepository }, "guard-1");

    expect(result).toEqual([]);
  });

  it("filtra por el rango de fechas de inicio del recorrido", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE_1]);

    await shiftSessionRepository.create(buildSession({ id: "session-1", siteId: SITE_1.id }));
    await roundRepository.create(
      buildRound({ id: "round-fuera", shiftSessionId: "session-1", startedAt: new Date("2025-12-31T08:00:00Z") }),
    );
    await roundRepository.create(
      buildRound({ id: "round-dentro", shiftSessionId: "session-1", startedAt: new Date("2026-01-05T08:00:00Z") }),
    );

    const result = await listGuardRounds({ roundRepository, shiftSessionRepository, siteRepository }, "guard-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((r) => r.round.id)).toEqual(["round-dentro"]);
  });
});
