import { describe, expect, it } from "vitest";

import { listGuardMissedScans } from "./list-guard-missed-scans";
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

describe("listGuardMissedScans", () => {
  it("devuelve las estaciones no escaneadas con su motivo, sitio y estación, de la más reciente a la más antigua", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await shiftSessionRepository.create(buildSession({}));
    await roundRepository.create(
      buildRound({
        scans: [
          buildScan({ id: "scan-1", status: "on-time" }),
          buildScan({
            id: "scan-2",
            stationId: "station-2",
            status: "missed",
            scannedAt: null,
            missedReport: {
              id: "missed-1",
              stationScanId: "scan-2",
              reason: "QR dañado, no se puede leer.",
              reportedAt: new Date("2026-01-01T08:15:00Z"),
            },
          }),
        ],
      }),
    );

    const result = await listGuardMissedScans({ roundRepository, shiftSessionRepository, siteRepository }, "guard-1");

    expect(result).toEqual([
      {
        siteName: "Plaza Amara",
        stationName: "Área de carga",
        roundSequence: 1,
        reason: "QR dañado, no se puede leer.",
        reportedAt: new Date("2026-01-01T08:15:00Z"),
      },
    ]);
  });

  it("no incluye recorridos de otros guardas", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await shiftSessionRepository.create(buildSession({ guardId: "guard-otro" }));
    await roundRepository.create(
      buildRound({
        shiftSessionId: "session-1",
        scans: [
          buildScan({
            status: "missed",
            missedReport: { id: "missed-1", stationScanId: "scan-1", reason: "N/A", reportedAt: new Date() },
          }),
        ],
      }),
    );

    const result = await listGuardMissedScans({ roundRepository, shiftSessionRepository, siteRepository }, "guard-1");

    expect(result).toEqual([]);
  });
});
