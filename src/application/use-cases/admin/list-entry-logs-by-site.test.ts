import { describe, expect, it } from "vitest";

import { listEntryLogsBySite } from "./list-entry-logs-by-site";
import { createMockEntryLogRepository } from "@/infrastructure/mock/repositories/mock-entry-log-repository";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { EntryLog } from "@/domain/entities/entry-log";

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  assignedSiteId: "site-1",
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

function buildLog(overrides: Partial<EntryLog>): EntryLog {
  return {
    id: "log-1",
    siteId: "site-1",
    guardId: GUARD.id,
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

describe("listEntryLogsBySite", () => {
  it("ordena la bitácora de ingresos del sitio de la más reciente a la más antigua, con el nombre del guarda", async () => {
    const entryLogRepository = createMockEntryLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await entryLogRepository.create(buildLog({ id: "log-1", createdAt: new Date("2026-01-01T08:00:00Z") }));
    await entryLogRepository.create(buildLog({ id: "log-2", createdAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listEntryLogsBySite({ entryLogRepository, userRepository }, "site-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].guardName).toBe("Ana Pérez");
  });

  it("no incluye bitácoras de otros sitios", async () => {
    const entryLogRepository = createMockEntryLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await entryLogRepository.create(buildLog({ id: "log-other", siteId: "site-2" }));

    const result = await listEntryLogsBySite({ entryLogRepository, userRepository }, "site-1");

    expect(result).toEqual([]);
  });
});
