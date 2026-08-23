import { describe, expect, it } from "vitest";

import { submitIncidentLog } from "./submit-incident-log";
import { createMockIncidentLogRepository } from "@/infrastructure/mock/repositories/mock-incident-log-repository";

describe("submitIncidentLog", () => {
  it("guarda la bitácora de incidencias con todos sus campos", async () => {
    const incidentLogRepository = createMockIncidentLogRepository();

    const log = await submitIncidentLog(
      { incidentLogRepository },
      {
        siteId: "site-1",
        guardId: "guard-1",
        incidentType: "Persona sospechosa",
        incidentTypeDetail: null,
        locationZone: "Entrada principal",
        description: "Persona merodeando por el parqueo.",
        photoUrls: [],
      },
    );

    expect(log.id).toBeTruthy();
    expect(log.incidentType).toBe("Persona sospechosa");
    expect(log.occurredAt).toBeInstanceOf(Date);
    await expect(incidentLogRepository.findBySite("site-1")).resolves.toEqual([log]);
  });

  it("guarda el detalle libre cuando el tipo de incidencia es Otro", async () => {
    const incidentLogRepository = createMockIncidentLogRepository();

    const log = await submitIncidentLog(
      { incidentLogRepository },
      {
        siteId: "site-1",
        guardId: "guard-1",
        incidentType: "Otro",
        incidentTypeDetail: "Fuga de agua en el parqueo",
        locationZone: "Entrada principal",
        description: "Se reportó fuga de agua importante.",
        photoUrls: [],
      },
    );

    expect(log.incidentType).toBe("Otro");
    expect(log.incidentTypeDetail).toBe("Fuga de agua en el parqueo");
  });
});
