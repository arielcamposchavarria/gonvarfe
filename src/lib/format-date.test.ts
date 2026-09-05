import { describe, expect, it } from "vitest";

import { formatDateCR, formatDateTimeCR, formatTimeCR } from "./format-date";

describe("format-date (America/Costa_Rica)", () => {
  it("convierte a la hora de Costa Rica (UTC-6) sin importar la zona horaria del proceso", () => {
    // 18:30 UTC == 12:30 en Costa Rica.
    const date = new Date("2026-01-01T18:30:00.000Z");

    expect(formatTimeCR(date)).toContain("12:30");
    expect(formatDateTimeCR(date)).toContain("12:30");
  });

  it("ajusta la fecha cuando el cruce de medianoche cae distinto en Costa Rica", () => {
    // 03:00 UTC del día 2 es todavía 21:00 del día 1 en Costa Rica.
    const date = new Date("2026-01-02T03:00:00.000Z");

    expect(formatDateCR(date)).toContain("1/1/2026");
    expect(formatTimeCR(date)).toContain("9:00");
  });
});
