import { describe, expect, it, vi } from "vitest";

import { registrarSalidaEntryLog } from "./registrar-salida-entry-log";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";

function buildLog(overrides: Partial<EntryLog> = {}): EntryLog {
  return {
    id: "log-1",
    sitioId: "sitio-1",
    guardId: "guard-1",
    date: "2026-08-19",
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
    createdAt: new Date("2026-08-19T08:00:00Z"),
    ...overrides,
  };
}

describe("registrarSalidaEntryLog", () => {
  it("reenvía el id del ingreso al repositorio y retorna el registro cerrado", async () => {
    const registrarSalida = vi.fn().mockResolvedValue(buildLog());
    const entryLogRepository: EntryLogRepository = {
      findBySite: vi.fn(),
      findByGuard: vi.fn(),
      create: vi.fn(),
      registrarSalida,
    };

    const result = await registrarSalidaEntryLog({ entryLogRepository }, "log-1");

    expect(registrarSalida).toHaveBeenCalledWith("log-1");
    expect(result.exitTime).toBe("08:15");
  });

  it("propaga el error del repositorio (p. ej. salida ya registrada)", async () => {
    const entryLogRepository: EntryLogRepository = {
      findBySite: vi.fn(),
      findByGuard: vi.fn(),
      create: vi.fn(),
      registrarSalida: vi.fn().mockRejectedValue(new Error("Esta entrada ya tiene salida registrada.")),
    };

    await expect(registrarSalidaEntryLog({ entryLogRepository }, "log-1")).rejects.toThrow(/salida registrada/);
  });
});
