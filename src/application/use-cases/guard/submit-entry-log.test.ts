import { describe, expect, it } from "vitest";

import { submitEntryLog } from "./submit-entry-log";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";

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

describe("submitEntryLog", () => {
  it("guarda la bitácora de ingreso con todos sus campos", async () => {
    const entryLogRepository = createFakeEntryLogRepository();

    const log = await submitEntryLog(
      { entryLogRepository },
      {
        sitioId: "sitio-1",
        guardId: "guard-1",
        date: "2026-08-19",
        plate: createPlateNumber("ABC123"),
        driverName: "Juan Pérez",
        cedula: createCedula("123456789"),
        company: "Acme S.A.",
        reason: "Entrega de mercadería",
        visitingLocal: "BAC",
        observations: "Sin novedad",
        photoUrls: [],
      },
    );

    expect(log.id).toBeTruthy();
    expect(log.sitioId).toBe("sitio-1");
    expect(log.visitingLocal).toBe("BAC");
    // horaEntrada/horaSalida los pone el backend real; el placeholder local
    // no debe confundirse con un ingreso ya cerrado.
    expect(log.exitTime).toBeNull();
    await expect(entryLogRepository.findBySite("sitio-1")).resolves.toEqual([log]);
  });
});
