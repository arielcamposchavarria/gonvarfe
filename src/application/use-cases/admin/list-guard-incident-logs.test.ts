import { describe, expect, it } from "vitest";

import { listGuardIncidentLogs } from "./list-guard-incident-logs";
import { createMockIncidentLogRepository } from "@/infrastructure/mock/repositories/mock-incident-log-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";
import type { IncidentLog } from "@/domain/entities/incident-log";

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

function buildLog(overrides: Partial<IncidentLog>): IncidentLog {
  return {
    id: "log-1",
    siteId: SITE.id,
    guardId: "guard-1",
    occurredAt: new Date("2026-01-01T08:00:00Z"),
    incidentType: "Otro",
    locationZone: "Entrada principal",
    description: "Sin novedad",
    photoUrls: [],
    createdAt: new Date("2026-01-01T08:00:00Z"),
    ...overrides,
  };
}

describe("listGuardIncidentLogs", () => {
  it("ordena la bitácora de incidencias del guard de la más reciente a la más antigua, con el sitio de origen", async () => {
    const incidentLogRepository = createMockIncidentLogRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await incidentLogRepository.create(buildLog({ id: "log-1", occurredAt: new Date("2026-01-01T08:00:00Z") }));
    await incidentLogRepository.create(buildLog({ id: "log-2", occurredAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listGuardIncidentLogs({ incidentLogRepository, siteRepository }, "guard-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].siteName).toBe("Plaza Amara");
  });

  it("no incluye bitácoras de otros guardas", async () => {
    const incidentLogRepository = createMockIncidentLogRepository();
    const siteRepository = createFakeSiteRepository([SITE]);

    await incidentLogRepository.create(buildLog({ id: "log-other", guardId: "guard-otro" }));

    const result = await listGuardIncidentLogs({ incidentLogRepository, siteRepository }, "guard-1");

    expect(result).toEqual([]);
  });
});
