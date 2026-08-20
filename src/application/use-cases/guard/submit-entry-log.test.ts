import { describe, expect, it } from "vitest";

import { submitEntryLog } from "./submit-entry-log";
import { createMockEntryLogRepository } from "@/infrastructure/mock/repositories/mock-entry-log-repository";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";

describe("submitEntryLog", () => {
  it("guarda la bitácora de ingreso con todos sus campos", async () => {
    const entryLogRepository = createMockEntryLogRepository();

    const log = await submitEntryLog(
      { entryLogRepository },
      {
        siteId: "site-1",
        guardId: "guard-1",
        date: "2026-08-19",
        entryTime: "08:00",
        exitTime: "08:15",
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
    expect(log.siteId).toBe("site-1");
    expect(log.visitingLocal).toBe("BAC");
    await expect(entryLogRepository.findBySite("site-1")).resolves.toEqual([log]);
  });
});
