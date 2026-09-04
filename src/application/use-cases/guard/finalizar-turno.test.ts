import { describe, expect, it, vi } from "vitest";

import { finalizarTurno, NoActiveTurnoError } from "./finalizar-turno";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno } from "@/domain/entities/turno";

function buildTurno(overrides: Partial<Turno> = {}): Turno {
  return {
    id: "turno-1",
    guardiaId: "guard-1",
    sitioId: "sitio-1",
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "activo",
    finalizadoEn: null,
    ...overrides,
  };
}

describe("finalizarTurno", () => {
  it("resuelve el turno activo y finaliza usando su id", async () => {
    const activo = buildTurno();
    const finalizado = { ...activo, estado: "finalizado" as const, finalizadoEn: new Date() };
    const finalizar = vi.fn().mockResolvedValue(finalizado);
    const turnoRepository: TurnoRepository = {
      activo: vi.fn().mockResolvedValue(activo),
      iniciar: vi.fn(),
      finalizar,
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    const result = await finalizarTurno({ turnoRepository });

    expect(finalizar).toHaveBeenCalledWith("turno-1");
    expect(result.estado).toBe("finalizado");
  });

  it("lanza NoActiveTurnoError si no hay turno activo, sin llamar a finalizar", async () => {
    const finalizar = vi.fn();
    const turnoRepository: TurnoRepository = {
      activo: vi.fn().mockResolvedValue(null),
      iniciar: vi.fn(),
      finalizar,
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    await expect(finalizarTurno({ turnoRepository })).rejects.toBeInstanceOf(NoActiveTurnoError);
    expect(finalizar).not.toHaveBeenCalled();
  });
});
