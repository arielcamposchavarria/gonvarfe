import { describe, expect, it, vi } from "vitest";

import { forzarFinalizarTurno } from "./forzar-finalizar-turno";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno } from "@/domain/entities/turno";

function buildTurno(overrides: Partial<Turno> = {}): Turno {
  return {
    id: "turno-1",
    guardiaId: "guard-1",
    sitioId: "sitio-1",
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "finalizado",
    finalizadoEn: new Date("2026-01-01T16:00:00Z"),
    ...overrides,
  };
}

describe("forzarFinalizarTurno", () => {
  it("reenvía el turnoId al repositorio y retorna el turno finalizado", async () => {
    const finalizado = buildTurno();
    const forzarFinalizar = vi.fn().mockResolvedValue(finalizado);
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar,
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    const result = await forzarFinalizarTurno({ turnoRepository }, "turno-1");

    expect(forzarFinalizar).toHaveBeenCalledWith("turno-1");
    expect(result.estado).toBe("finalizado");
  });

  it("propaga el error del repositorio (p. ej. turno ya finalizado)", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn().mockRejectedValue(new Error("Este turno ya está finalizado.")),
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    await expect(forzarFinalizarTurno({ turnoRepository }, "turno-1")).rejects.toThrow(/ya está finalizado/);
  });
});
