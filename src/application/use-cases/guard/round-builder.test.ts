import { describe, expect, it } from "vitest";

import { buildRound } from "./round-builder";
import type { Site } from "@/domain/entities/site";

function siteWithStations(count: number): Site {
  return {
    id: "site-test",
    name: "Sitio de prueba",
    address: "N/A",
    isActive: true,
    startQrCodeId: "qr-start",
    exitQrCodeId: "qr-exit",
    stations: Array.from({ length: count }, (_, index) => ({
      id: `station-${index + 1}`,
      siteId: "site-test",
      name: `Estación ${index + 1}`,
      order: index + 1,
      qrCodeId: `qr-${index + 1}`,
    })),
    visitingLocals: ["Otro"],
  };
}

const STARTED_AT = new Date("2026-01-01T08:00:00.000Z");

describe("buildRound", () => {
  it("limita la ventana de cada estación a un máximo de 2 minutos aunque repartir la hora dé más", () => {
    const site = siteWithStations(4); // 60 / 4 = 15 min sin tope
    const round = buildRound({ id: "round-1", shiftSessionId: "session-1", site, sequence: 1, startedAt: STARTED_AT });

    const secondScan = round.scans.find((s) => s.order === 2);
    expect(secondScan?.window.opensAt).toEqual(new Date(STARTED_AT.getTime() + 2 * 60_000));
    expect(secondScan?.window.closesAt).toEqual(new Date(STARTED_AT.getTime() + 4 * 60_000));
  });

  it("no reduce la ventana si repartir la hora ya da 2 minutos o menos por estación", () => {
    const site = siteWithStations(60); // 60 / 60 = 1 min por estación
    const round = buildRound({ id: "round-1", shiftSessionId: "session-1", site, sequence: 1, startedAt: STARTED_AT });

    const secondScan = round.scans.find((s) => s.order === 2);
    expect(secondScan?.window.opensAt).toEqual(new Date(STARTED_AT.getTime() + 1 * 60_000));
    expect(secondScan?.window.closesAt).toEqual(new Date(STARTED_AT.getTime() + 2 * 60_000));
  });
});
