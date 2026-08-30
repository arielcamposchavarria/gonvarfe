import { describe, expect, it } from "vitest";

import { listGuardIncidentLogs } from "./list-guard-incident-logs";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { Sitio } from "@/domain/entities/sitio";
import type { IncidentLog } from "@/domain/entities/incident-log";

const SITE: Sitio = { id: "site-1", nombre: "Plaza Amara", direccion: "N/A", activo: true, marcas: [], locales: [] };

function createFakeSitioRepository(sitios: Sitio[]): SitioRepository {
  return {
    async findAll() {
      return sitios;
    },
    async findById(id) {
      return sitios.find((sitio) => sitio.id === id) ?? null;
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
    async update() {
      return null;
    },
    async deactivate() {
      return null;
    },
    async addMarca() {
      return null;
    },
    async generateMarcaQr() {
      return null;
    },
    async updateMarca() {
      return null;
    },
    async deactivateMarca() {
      return null;
    },
    async createLocal() {
      return null;
    },
  };
}

function createFakeIncidentLogRepository(): IncidentLogRepository {
  const logs: IncidentLog[] = [];
  return {
    async findBySite(sitioId) {
      return logs.filter((log) => log.sitioId === sitioId);
    },
    async findByGuard(guardId) {
      return logs.filter((log) => log.guardId === guardId);
    },
    async create(log) {
      logs.push(log);
      return log;
    },
  };
}

function buildLog(overrides: Partial<IncidentLog>): IncidentLog {
  return {
    id: "log-1",
    sitioId: SITE.id,
    guardId: "guard-1",
    occurredAt: new Date("2026-01-01T08:00:00Z"),
    incidentType: "Otro",
    incidentTypeDetail: null,
    locationZone: "Entrada principal",
    description: "Sin novedad",
    photoUrls: [],
    createdAt: new Date("2026-01-01T08:00:00Z"),
    ...overrides,
  };
}

describe("listGuardIncidentLogs", () => {
  it("ordena la bitácora de incidencias del guard de la más reciente a la más antigua, con el sitio de origen", async () => {
    const incidentLogRepository = createFakeIncidentLogRepository();
    const sitioRepository = createFakeSitioRepository([SITE]);

    await incidentLogRepository.create(buildLog({ id: "log-1", occurredAt: new Date("2026-01-01T08:00:00Z") }));
    await incidentLogRepository.create(buildLog({ id: "log-2", occurredAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listGuardIncidentLogs({ incidentLogRepository, sitioRepository }, "guard-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].siteName).toBe("Plaza Amara");
  });

  it("no incluye bitácoras de otros guardas", async () => {
    const incidentLogRepository = createFakeIncidentLogRepository();
    const sitioRepository = createFakeSitioRepository([SITE]);

    await incidentLogRepository.create(buildLog({ id: "log-other", guardId: "guard-otro" }));

    const result = await listGuardIncidentLogs({ incidentLogRepository, sitioRepository }, "guard-1");

    expect(result).toEqual([]);
  });

  it("filtra por el rango de fechas de la incidencia", async () => {
    const incidentLogRepository = createFakeIncidentLogRepository();
    const sitioRepository = createFakeSitioRepository([SITE]);

    await incidentLogRepository.create(buildLog({ id: "log-fuera", occurredAt: new Date("2025-12-31T08:00:00Z") }));
    await incidentLogRepository.create(buildLog({ id: "log-dentro", occurredAt: new Date("2026-01-05T08:00:00Z") }));

    const result = await listGuardIncidentLogs({ incidentLogRepository, sitioRepository }, "guard-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((r) => r.log.id)).toEqual(["log-dentro"]);
  });
});
