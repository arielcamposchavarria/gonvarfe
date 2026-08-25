import { describe, expect, it } from "vitest";

import { getGuardDetail } from "./get-guard-detail";
import { createMockRoundRepository } from "@/infrastructure/mock/repositories/mock-round-repository";
import { createMockShiftSessionRepository } from "@/infrastructure/mock/repositories/mock-shift-session-repository";
import { createMockEntryLogRepository } from "@/infrastructure/mock/repositories/mock-entry-log-repository";
import { createMockIncidentLogRepository } from "@/infrastructure/mock/repositories/mock-incident-log-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser, AppUser } from "@/domain/entities/user";
import type { Round } from "@/domain/entities/round";
import type { ShiftSession } from "@/domain/entities/shift-session";
import type { Site } from "@/domain/entities/site";
import type { StationScan } from "@/domain/entities/station-scan";
import { createTimeWindow } from "@/domain/value-objects/time-window";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";

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

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  assignedSiteId: SITE_1.id,
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

function createFakeUserRepository(users: AppUser[]): UserRepository {
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
    guardId: GUARD.id,
    siteId: SITE_1.id,
    startedAt: new Date("2026-01-01T08:00:00Z"),
    status: "completed",
    endedAt: new Date("2026-01-01T09:00:00Z"),
    ...overrides,
  };
}

describe("getGuardDetail", () => {
  it("suma los escaneos, recorridos y bitácoras del guard a través de todas sus jornadas", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const entryLogRepository = createMockEntryLogRepository();
    const incidentLogRepository = createMockIncidentLogRepository();
    const siteRepository = createFakeSiteRepository([SITE_1, SITE_2]);
    const userRepository = createFakeUserRepository([GUARD]);

    await shiftSessionRepository.create(buildSession({ id: "session-1", status: "completed" }));
    await roundRepository.create(
      buildRound({
        id: "round-1",
        shiftSessionId: "session-1",
        scans: [
          buildScan({ id: "scan-1", status: "on-time" }),
          buildScan({ id: "scan-2", status: "missed", missedReport: { id: "m-1", stationScanId: "scan-2", reason: "QR dañado", reportedAt: new Date() } }),
        ],
      }),
    );

    await shiftSessionRepository.create(
      buildSession({ id: "session-2", siteId: SITE_2.id, status: "active", endedAt: null }),
    );
    await roundRepository.create(
      buildRound({
        id: "round-2",
        shiftSessionId: "session-2",
        siteId: SITE_2.id,
        status: "in-progress",
        completedAt: null,
        scans: [buildScan({ id: "scan-3", status: "on-time" })],
      }),
    );

    await entryLogRepository.create({
      id: "entry-1",
      siteId: SITE_1.id,
      guardId: GUARD.id,
      date: "2026-01-01",
      entryTime: "08:00",
      exitTime: "08:15",
      plate: createPlateNumber("ABC123"),
      driverName: "Juan Pérez",
      cedula: createCedula("123456789"),
      company: "Acme",
      reason: "Entrega",
      visitingLocal: "BAC",
      observations: "",
      photoUrls: [],
      createdAt: new Date("2026-01-01T08:10:00Z"),
    });

    await incidentLogRepository.create({
      id: "incident-1",
      siteId: SITE_1.id,
      guardId: GUARD.id,
      occurredAt: new Date("2026-01-01T08:20:00Z"),
      incidentType: "Otro",
      incidentTypeDetail: null,
      locationZone: "Entrada",
      description: "Sin novedad",
      photoUrls: [],
      createdAt: new Date("2026-01-01T08:20:00Z"),
    });

    const detail = await getGuardDetail(
      { userRepository, siteRepository, shiftSessionRepository, roundRepository, entryLogRepository, incidentLogRepository },
      GUARD.id,
    );

    expect(detail?.assignedSite.id).toBe(SITE_1.id);
    expect(detail?.currentSite?.id).toBe(SITE_2.id);
    expect(detail?.totals).toEqual({
      scansOnTime: 2,
      scansMissed: 1,
      roundsCompleted: 1,
      entryLogsCount: 1,
      incidentLogsCount: 1,
    });
  });

  it("no tiene sitio actual si el guard no tiene una jornada activa", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const entryLogRepository = createMockEntryLogRepository();
    const incidentLogRepository = createMockIncidentLogRepository();
    const siteRepository = createFakeSiteRepository([SITE_1]);
    const userRepository = createFakeUserRepository([GUARD]);

    const detail = await getGuardDetail(
      { userRepository, siteRepository, shiftSessionRepository, roundRepository, entryLogRepository, incidentLogRepository },
      GUARD.id,
    );

    expect(detail?.currentSite).toBeNull();
    expect(detail?.totals).toEqual({
      scansOnTime: 0,
      scansMissed: 0,
      roundsCompleted: 0,
      entryLogsCount: 0,
      incidentLogsCount: 0,
    });
  });

  it("devuelve null si el usuario no existe o no es un guard", async () => {
    const roundRepository = createMockRoundRepository();
    const shiftSessionRepository = createMockShiftSessionRepository();
    const entryLogRepository = createMockEntryLogRepository();
    const incidentLogRepository = createMockIncidentLogRepository();
    const siteRepository = createFakeSiteRepository([SITE_1]);
    const admin: AppUser = {
      id: "admin-1",
      name: "Admin",
      username: "admin",
      role: "admin",
      isActive: true,
      createdAt: new Date("2025-01-01"),
    };
    const userRepository = createFakeUserRepository([admin]);

    await expect(
      getGuardDetail(
        { userRepository, siteRepository, shiftSessionRepository, roundRepository, entryLogRepository, incidentLogRepository },
        "guard-missing",
      ),
    ).resolves.toBeNull();

    await expect(
      getGuardDetail(
        { userRepository, siteRepository, shiftSessionRepository, roundRepository, entryLogRepository, incidentLogRepository },
        admin.id,
      ),
    ).resolves.toBeNull();
  });
});
