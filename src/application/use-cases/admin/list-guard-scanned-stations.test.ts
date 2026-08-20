import { describe, expect, it } from "vitest";

import { listGuardScannedStations } from "./list-guard-scanned-stations";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";
import type { Round } from "@/domain/entities/round";
import type { ShiftSession } from "@/domain/entities/shift-session";
import type { StationScan } from "@/domain/entities/station-scan";
import { createTimeWindow } from "@/domain/value-objects/time-window";

const SITE: Site = {
  id: "site-1",
  name: "Plaza Amara",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start",
  exitQrCodeId: "qr-exit",
  stations: [
    { id: "station-1", siteId: "site-1", name: "Entrada principal", order: 1, qrCodeId: "qr-1" },
    { id: "station-2", siteId: "site-1", name: "Área de carga", order: 2, qrCodeId: "qr-2" },
  ],
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
  };
}

function buildScan(overrides: Partial<StationScan>): StationScan {
  return {
    id: crypto.randomUUID(),
    roundId: "round-1",
    stationId: "station-1",
    order: 1,
    window: createTimeWindow(new Date("2026-01-01T08:00:00Z"), 5),
    status: "on-time",
    scannedAt: new Date("2026-01-01T08:01:00Z"),
    missedReport: null,
    ...overrides,
  };
}

function buildRound(overrides: Partial<Round>): Round {
  return {
    id: "round-1",
    shiftSessionId: "session-1",
    siteId: SITE.id,
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
    siteId: SITE.id,
    startedAt: new Date("2026-01-01T08:00:00Z"),
    status: "completed",
    endedAt: new Date("2026-01-01T09:00:00Z"),
    ...overrides,
  };
}

describe("listGuardScannedStations", () => {
  it("devuelve solo las estaciones escaneadas a tiempo, con su sitio y estación, de la más reciente a la más antigua", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await shiftSessionRepository.create(buildSession({}));
    await roundRepository.create(
      buildRound({
        scans: [
          buildScan({ id: "scan-1", stationId: "station-1", scannedAt: new Date("2026-01-01T08:01:00Z") }),
          buildScan({ id: "scan-2", stationId: "station-2", scannedAt: new Date("2026-01-01T08:06:00Z") }),
          buildScan({ id: "scan-3", status: "missed", scannedAt: null, missedReport: null }),
          buildScan({ id: "scan-4", status: "pending", scannedAt: null }),
        ],
      }),
    );

    const result = await listGuardScannedStations(
      { roundRepository, shiftSessionRepository, siteRepository },
      "guard-1",
    );

    expect(result).toEqual([
      { siteName: "Plaza Amara", stationName: "Área de carga", roundSequence: 1, scannedAt: new Date("2026-01-01T08:06:00Z") },
      { siteName: "Plaza Amara", stationName: "Entrada principal", roundSequence: 1, scannedAt: new Date("2026-01-01T08:01:00Z") },
    ]);
  });

  it("no incluye escaneos de otros guardas", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await shiftSessionRepository.create(buildSession({ guardId: "guard-otro" }));
    await roundRepository.create(buildRound({ scans: [buildScan({})] }));

    const result = await listGuardScannedStations(
      { roundRepository, shiftSessionRepository, siteRepository },
      "guard-1",
    );

    expect(result).toEqual([]);
  });
});
