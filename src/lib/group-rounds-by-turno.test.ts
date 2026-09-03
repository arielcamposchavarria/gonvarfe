import { describe, expect, it } from "vitest";

import { groupRoundsByTurno } from "./group-rounds-by-turno";

function round(turnoId: string, turnoIniciadoEn: string, secuencia: number) {
  return { recorrido: { secuencia }, turnoId, turnoIniciadoEn: new Date(turnoIniciadoEn) };
}

describe("groupRoundsByTurno", () => {
  it("agrupa los recorridos que comparten turnoId en un solo grupo", () => {
    const rounds = [
      round("turno-1", "2026-01-15T22:00:00Z", 1),
      round("turno-1", "2026-01-15T22:00:00Z", 2),
      round("turno-2", "2026-01-16T08:00:00Z", 1),
    ];

    const groups = groupRoundsByTurno(rounds);

    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.turnoId === "turno-1")?.items).toHaveLength(2);
    expect(groups.find((g) => g.turnoId === "turno-2")?.items).toHaveLength(1);
  });

  it("ordena los grupos del turno más reciente al más antiguo", () => {
    const rounds = [round("turno-viejo", "2026-01-01T08:00:00Z", 1), round("turno-nuevo", "2026-01-20T08:00:00Z", 1)];

    const groups = groupRoundsByTurno(rounds);

    expect(groups.map((g) => g.turnoId)).toEqual(["turno-nuevo", "turno-viejo"]);
  });

  it("dentro de un grupo, ordena los recorridos por secuencia ascendente (cronológico)", () => {
    const rounds = [round("turno-1", "2026-01-15T22:00:00Z", 3), round("turno-1", "2026-01-15T22:00:00Z", 1), round("turno-1", "2026-01-15T22:00:00Z", 2)];

    const groups = groupRoundsByTurno(rounds);

    expect(groups[0].items.map((r) => r.recorrido.secuencia)).toEqual([1, 2, 3]);
  });

  it("un recorrido cuyo turno arrancó pasada la medianoche del día anterior sigue agrupado junto al resto del turno", () => {
    // El turno empezó el 15 a las 23:50; el segundo recorrido de ese mismo
    // turno arrancó ya el 16 a la 01:00 — deben seguir en el mismo grupo,
    // identificado por turnoId, no por la fecha individual del recorrido.
    const rounds = [round("turno-1", "2026-01-15T23:50:00Z", 1), round("turno-1", "2026-01-15T23:50:00Z", 2)];

    const groups = groupRoundsByTurno(rounds);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(2);
  });
});
