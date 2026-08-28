import { describe, expect, it } from "vitest";

import { listIncidentLogsBySite } from "./list-incident-logs-by-site";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { IncidentLog } from "@/domain/entities/incident-log";

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
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
    sitioId: "site-1",
    guardId: GUARD.id,
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

describe("listIncidentLogsBySite", () => {
  it("ordena la bitácora de incidencias del sitio de la más reciente a la más antigua, con el nombre del guarda", async () => {
    const incidentLogRepository = createFakeIncidentLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await incidentLogRepository.create(buildLog({ id: "log-1", occurredAt: new Date("2026-01-01T08:00:00Z") }));
    await incidentLogRepository.create(buildLog({ id: "log-2", occurredAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listIncidentLogsBySite({ incidentLogRepository, userRepository }, "site-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].guardName).toBe("Ana Pérez");
  });

  it("no incluye bitácoras de otros sitios", async () => {
    const incidentLogRepository = createFakeIncidentLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await incidentLogRepository.create(buildLog({ id: "log-other", sitioId: "site-2" }));

    const result = await listIncidentLogsBySite({ incidentLogRepository, userRepository }, "site-1");

    expect(result).toEqual([]);
  });
});
