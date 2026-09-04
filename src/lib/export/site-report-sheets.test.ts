import { describe, expect, it } from "vitest";

import { buildSiteRoundsSheet, buildSiteEntryLogsSheet, buildSiteIncidentLogsSheet } from "./site-report-sheets";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { EntryLog } from "@/domain/entities/entry-log";
import type { IncidentLog } from "@/domain/entities/incident-log";

const RECORRIDO: Recorrido = {
  id: "recorrido-1",
  turnoId: "turno-1",
  sitioId: "site-1",
  secuencia: 2,
  iniciadoEn: new Date("2026-01-01T08:00:00.000Z"),
  estado: "completado",
  completadoEn: new Date("2026-01-01T09:00:00.000Z"),
  registros: [
    {
      id: "registro-1",
      marcaId: "marca-1",
      orden: 1,
      estado: "a-tiempo",
      abreEn: new Date(),
      cierraEn: new Date(),
      escaneadoEn: new Date(),
      motivoPerdido: null,
    },
    {
      id: "registro-2",
      marcaId: "marca-2",
      orden: 2,
      estado: "perdido",
      abreEn: new Date(),
      cierraEn: new Date(),
      escaneadoEn: null,
      motivoPerdido: "QR dañado",
    },
  ],
};

const TURNO_INICIADO_EN = new Date("2026-01-01T07:30:00.000Z");

describe("buildSiteRoundsSheet", () => {
  it("resume cada recorrido del sitio con el guarda, el turno, estado y conteo de marcas", () => {
    const sheet = buildSiteRoundsSheet([
      {
        recorrido: RECORRIDO,
        guardName: "Ana Pérez",
        turnoId: "turno-1",
        turnoIniciadoEn: TURNO_INICIADO_EN,
        turnoEstado: "finalizado",
      },
    ]);

    expect(sheet.name).toBe("Recorridos");
    expect(sheet.columns.map((c) => c.header)).toEqual(
      expect.arrayContaining(["Guarda", "Turno iniciado"]),
    );
    expect(sheet.rows).toEqual([
      {
        guard: "Ana Pérez",
        turnoStartedAt: TURNO_INICIADO_EN.toLocaleString(),
        sequence: 2,
        status: "Completado",
        startedAt: RECORRIDO.iniciadoEn.toLocaleString(),
        completedAt: RECORRIDO.completadoEn!.toLocaleString(),
        onTime: 1,
        missed: 1,
      },
    ]);
  });
});

describe("buildSiteEntryLogsSheet", () => {
  it("mapea la bitácora de ingresos del sitio con el nombre del guarda y el conteo de fotos", () => {
    const log: EntryLog = {
      id: "log-1",
      sitioId: "site-1",
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

    const sheet = buildSiteEntryLogsSheet([{ log, guardName: "Ana Pérez" }]);

    expect(sheet.name).toBe("Bitácora de ingresos");
    expect(sheet.rows).toEqual([
      {
        guard: "Ana Pérez",
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

describe("buildSiteIncidentLogsSheet", () => {
  it("mapea la bitácora de incidencias del sitio con el nombre del guarda", () => {
    const log: IncidentLog = {
      id: "log-1",
      sitioId: "site-1",
      guardId: "guard-1",
      occurredAt: new Date("2026-01-01T08:20:00.000Z"),
      incidentType: "Otro",
      incidentTypeDetail: "Fuga de agua en el parqueo",
      locationZone: "Entrada",
      description: "Sin novedad",
      photoUrls: [],
      createdAt: new Date(),
    };

    const sheet = buildSiteIncidentLogsSheet([{ log, guardName: "Ana Pérez" }]);

    expect(sheet.name).toBe("Bitácora de incidencias");
    expect(sheet.rows).toEqual([
      {
        guard: "Ana Pérez",
        occurredAt: log.occurredAt.toLocaleString(),
        incidentType: "Fuga de agua en el parqueo",
        locationZone: "Entrada",
        description: "Sin novedad",
        photoCount: 0,
      },
    ]);
  });
});
