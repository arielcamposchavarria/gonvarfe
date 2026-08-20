import { describe, expect, it } from "vitest";

import { listGuardEntryLogs } from "./list-guard-entry-logs";
import { createMockEntryLogRepository } from "@/infrastructure/mock/repositories/mock-entry-log-repository";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";
import type { EntryLog } from "@/domain/entities/entry-log";

const SITE: Site = {
  id: "site-1",
  name: "Plaza Amara",
  address: "N/A",
  isActive: true,
  startQrCodeId: "qr-start",
  exitQrCodeId: "qr-exit",
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
  };
}

function buildLog(overrides: Partial<EntryLog>): EntryLog {
  return {
    id: "log-1",
    siteId: SITE.id,
    guardId: "guard-1",
    date: "2026-01-01",
    entryTime: "08:00",
    exitTime: "08:15",
    plate: createPlateNumber("ABC123"),
    driverName: "Juan Pérez",
    cedula: createCedula("123456789"),
    company: "Acme S.A.",
    reason: "Entrega",
    visitingLocal: "BAC",
    observations: "",
    photoUrls: [],
    createdAt: new Date("2026-01-01T08:00:00Z"),
    ...overrides,
  };
}

describe("listGuardEntryLogs", () => {
  it("ordena la bitácora de ingresos del guard de la más reciente a la más antigua, con el sitio de origen", async () => {
    const entryLogRepository = createMockEntryLogRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await entryLogRepository.create(buildLog({ id: "log-1", createdAt: new Date("2026-01-01T08:00:00Z") }));
    await entryLogRepository.create(buildLog({ id: "log-2", createdAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listGuardEntryLogs({ entryLogRepository, siteRepository }, "guard-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].siteName).toBe("Plaza Amara");
  });

  it("no incluye bitácoras de otros guardas", async () => {
    const entryLogRepository = createMockEntryLogRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await entryLogRepository.create(buildLog({ id: "log-other", guardId: "guard-otro" }));

    const result = await listGuardEntryLogs({ entryLogRepository, siteRepository }, "guard-1");

    expect(result).toEqual([]);
  });
});
