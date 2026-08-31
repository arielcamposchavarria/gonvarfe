import { describe, expect, it } from "vitest";

import { listEntryLogsBySite } from "./list-entry-logs-by-site";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { EntryLog } from "@/domain/entities/entry-log";

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
    async assignSite() {
      throw new Error("No usado en esta prueba.");
    },
  };
}

function createFakeEntryLogRepository(): EntryLogRepository {
  const logs: EntryLog[] = [];
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
    async registrarSalida(logId) {
      const log = logs.find((entry) => entry.id === logId);
      if (!log) throw new Error("No existe.");
      return log;
    },
  };
}

function buildLog(overrides: Partial<EntryLog>): EntryLog {
  return {
    id: "log-1",
    sitioId: "site-1",
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
    const entryLogRepository = createFakeEntryLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await entryLogRepository.create(buildLog({ id: "log-1", createdAt: new Date("2026-01-01T08:00:00Z") }));
    await entryLogRepository.create(buildLog({ id: "log-2", createdAt: new Date("2026-01-01T10:00:00Z") }));

    const result = await listEntryLogsBySite({ entryLogRepository, userRepository }, "site-1");

    expect(result.map((r) => r.log.id)).toEqual(["log-2", "log-1"]);
    expect(result[0].guardName).toBe("Ana Pérez");
  });

  it("no incluye bitácoras de otros sitios", async () => {
    const entryLogRepository = createFakeEntryLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await entryLogRepository.create(buildLog({ id: "log-other", sitioId: "site-2" }));

    const result = await listEntryLogsBySite({ entryLogRepository, userRepository }, "site-1");

    expect(result).toEqual([]);
  });

  it("filtra por el rango de fechas de creación", async () => {
    const entryLogRepository = createFakeEntryLogRepository();
    const userRepository = createFakeUserRepository([GUARD]);

    await entryLogRepository.create(buildLog({ id: "log-fuera", createdAt: new Date("2025-12-31T08:00:00Z") }));
    await entryLogRepository.create(buildLog({ id: "log-dentro", createdAt: new Date("2026-01-05T08:00:00Z") }));

    const result = await listEntryLogsBySite({ entryLogRepository, userRepository }, "site-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((r) => r.log.id)).toEqual(["log-dentro"]);
  });
});
