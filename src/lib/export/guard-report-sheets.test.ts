import { describe, expect, it } from "vitest";

import {
  buildGuardRoundsSheet,
  buildGuardScannedStationsSheet,
  buildGuardMissedScansSheet,
  buildGuardEntryLogsSheet,
  buildGuardIncidentLogsSheet,
} from "./guard-report-sheets";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { Round } from "@/domain/entities/round";
import type { EntryLog } from "@/domain/entities/entry-log";
import type { IncidentLog } from "@/domain/entities/incident-log";

const ROUND: Round = {
  id: "round-1",
  shiftSessionId: "session-1",
  siteId: "site-1",
  sequence: 2,
  startedAt: new Date("2026-01-01T08:00:00.000Z"),
  status: "completed",
  completedAt: new Date("2026-01-01T09:00:00.000Z"),
  scans: [
    {
      id: "scan-1",
      roundId: "round-1",
      stationId: "station-1",
      order: 1,
      window: { opensAt: new Date(), closesAt: new Date() },
      status: "on-time",
      scannedAt: new Date(),
      missedReport: null,
    },
    {
      id: "scan-2",
      roundId: "round-1",
      stationId: "station-2",
      order: 2,
      window: { opensAt: new Date(), closesAt: new Date() },
      status: "missed",
      scannedAt: null,
      missedReport: { id: "m-1", stationScanId: "scan-2", reason: "QR dañado", reportedAt: new Date() },
    },
  ],
};

describe("buildGuardRoundsSheet", () => {
  it("resume cada recorrido con su sitio, estado y conteo de estaciones", () => {
    const sheet = buildGuardRoundsSheet([{ round: ROUND, siteName: "Plaza Amara" }]);

    expect(sheet.name).toBe("Recorridos");
    expect(sheet.rows).toEqual([
      {
        site: "Plaza Amara",
        sequence: 2,
        status: "Completado",
        startedAt: ROUND.startedAt.toLocaleString(),
        completedAt: ROUND.completedAt!.toLocaleString(),
        onTime: 1,
        missed: 1,
      },
    ]);
  });
});

describe("buildGuardScannedStationsSheet", () => {
  it("mapea cada escaneo a tiempo a una fila", () => {
    const scannedAt = new Date("2026-01-01T08:05:00.000Z");
    const sheet = buildGuardScannedStationsSheet([
      { siteName: "Plaza Amara", stationName: "Entrada principal", roundSequence: 1, scannedAt },
    ]);

    expect(sheet.name).toBe("QR escaneados");
    expect(sheet.rows).toEqual([
      { site: "Plaza Amara", station: "Entrada principal", round: 1, scannedAt: scannedAt.toLocaleString() },
    ]);
  });
});

describe("buildGuardMissedScansSheet", () => {
  it("incluye el motivo reportado", () => {
    const reportedAt = new Date("2026-01-01T08:10:00.000Z");
    const sheet = buildGuardMissedScansSheet([
      { siteName: "Plaza Amara", stationName: "Área de carga", roundSequence: 1, reason: "QR dañado", reportedAt },
    ]);

    expect(sheet.name).toBe("QR no escaneados");
    expect(sheet.rows).toEqual([
      {
        site: "Plaza Amara",
        station: "Área de carga",
        round: 1,
        reportedAt: reportedAt.toLocaleString(),
        reason: "QR dañado",
      },
    ]);
  });
});

describe("buildGuardEntryLogsSheet", () => {
  it("mapea la bitácora de ingresos con el conteo de fotos adjuntas", () => {
    const log: EntryLog = {
      id: "log-1",
      siteId: "site-1",
      guardId: "guard-1",
      date: "2026-01-01",
      entryTime: "08:00",
      exitTime: "08:15",
      plate: createPlateNumber("ABC123"),
      driverName: "Juan Pérez",
      cedula: createCedula("123456789"),
      company: "Acme",
      reason: "Entrega",
      visitingLocal: "BAC",
      observations: "Sin novedad",
      photoUrls: ["data:image/png;base64,AAA"],
      createdAt: new Date(),
    };

    const sheet = buildGuardEntryLogsSheet([{ log, siteName: "Plaza Amara" }]);

    expect(sheet.name).toBe("Bitácora de ingresos");
    expect(sheet.rows).toEqual([
      {
        site: "Plaza Amara",
        date: "2026-01-01",
        entryTime: "08:00",
        exitTime: "08:15",
        driverName: "Juan Pérez",
        cedula: "123456789",
        plate: "ABC123",
        company: "Acme",
        reason: "Entrega",
        visitingLocal: "BAC",
        observations: "Sin novedad",
        photoCount: 1,
      },
    ]);
  });
});

describe("buildGuardIncidentLogsSheet", () => {
  it("mapea la bitácora de incidencias con el conteo de fotos adjuntas", () => {
    const log: IncidentLog = {
      id: "log-1",
      siteId: "site-1",
      guardId: "guard-1",
      occurredAt: new Date("2026-01-01T08:20:00.000Z"),
      incidentType: "Otro",
      locationZone: "Entrada",
      description: "Sin novedad",
      photoUrls: [],
      createdAt: new Date(),
    };

    const sheet = buildGuardIncidentLogsSheet([{ log, siteName: "Plaza Amara" }]);

    expect(sheet.name).toBe("Bitácora de incidencias");
    expect(sheet.rows).toEqual([
      {
        site: "Plaza Amara",
        occurredAt: log.occurredAt.toLocaleString(),
        incidentType: "Otro",
        locationZone: "Entrada",
        description: "Sin novedad",
        photoCount: 0,
      },
    ]);
  });
});
