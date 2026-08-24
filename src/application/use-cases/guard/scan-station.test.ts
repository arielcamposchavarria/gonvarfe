import { beforeEach, describe, expect, it } from "vitest";

import { scanStation, NoActiveShiftError } from "./scan-station";
import { startShift } from "./start-shift";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { ClockService } from "@/domain/ports/clock-service";
import type { Site } from "@/domain/entities/site";
import type { GuardUser } from "@/domain/entities/user";

const TEST_SITE: Site = {
  id: "site-test",
  name: "Sitio de prueba",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start",
  exitQrCodeId: "qr-exit",
  stations: [
    { id: "station-1", siteId: "site-test", name: "Estación 1", order: 1, qrCodeId: "qr-start" },
    { id: "station-2", siteId: "site-test", name: "Estación 2", order: 2, qrCodeId: "qr-2" },
    { id: "station-3", siteId: "site-test", name: "Estación 3", order: 3, qrCodeId: "qr-3" },
    { id: "station-4", siteId: "site-test", name: "Estación 4", order: 4, qrCodeId: "qr-4" },
  ],
  visitingLocals: ["Recepción", "Otro"],
};

const GUARD: GuardUser = {
  id: "guard-test",
  name: "Guard de prueba",
  username: "guard-test",
  role: "guard",
  assignedSiteId: TEST_SITE.id,
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

function createFakeSiteRepository(): SiteRepository {
  return {
    async findAll() {
      return [TEST_SITE];
    },
    async findById(id) {
      return id === TEST_SITE.id ? TEST_SITE : null;
    },
    async create(site) {
      return site;
    },
    async addVisitingLocal() {
      return null;
    },
  };
}

class FakeClock implements ClockService {
  private current: Date;

  constructor(initial: Date) {
    this.current = initial;
  }

  now(): Date {
    return this.current;
  }

  advanceMinutes(minutes: number): void {
    this.current = new Date(this.current.getTime() + minutes * 60_000);
  }
}

describe("scanStation", () => {
  let shiftSessionRepository: ReturnType<typeof createMockShiftSessionRepository>;
  let roundRepository: ReturnType<typeof createMockRoundRepository>;
  let siteRepository: SiteRepository;
  let clock: FakeClock;

  beforeEach(() => {
    shiftSessionRepository = createMockShiftSessionRepository();
    roundRepository = createMockRoundRepository();
    siteRepository = createFakeSiteRepository();
    clock = new FakeClock(new Date("2026-01-01T08:00:00.000Z"));
  });

  function deps() {
    return { shiftSessionRepository, roundRepository, siteRepository, clockService: clock };
  }

  it("rechaza escanear una estación antes de que abra su ventana de 2 minutos (tope máximo)", async () => {
    await startShift(deps(), GUARD);

    await expect(scanStation(deps(), { guardId: GUARD.id, stationId: "station-2" })).rejects.toThrow(
      /Todavía no puede escanear/,
    );
  });

  it("permite escanear una estación una vez abierta su ventana", async () => {
    await startShift(deps(), GUARD);
    clock.advanceMinutes(2);

    const result = await scanStation(deps(), { guardId: GUARD.id, stationId: "station-2" });
    const scan = result.round.scans.find((s) => s.stationId === "station-2");

    expect(scan?.status).toBe("on-time");
    expect(result.roundCompleted).toBe(false);
  });

  it("marca el recorrido como completado al escanear la última estación", async () => {
    await startShift(deps(), GUARD);
    clock.advanceMinutes(2);
    await scanStation(deps(), { guardId: GUARD.id, stationId: "station-2" });
    clock.advanceMinutes(2);
    await scanStation(deps(), { guardId: GUARD.id, stationId: "station-3" });
    clock.advanceMinutes(2);

    const result = await scanStation(deps(), { guardId: GUARD.id, stationId: "station-4" });

    expect(result.roundCompleted).toBe(true);
    expect(result.round.status).toBe("completed");
  });

  it("lanza NoActiveShiftError si el guard no ha iniciado jornada", async () => {
    await expect(scanStation(deps(), { guardId: GUARD.id, stationId: "station-1" })).rejects.toBeInstanceOf(
      NoActiveShiftError,
    );
  });
});
