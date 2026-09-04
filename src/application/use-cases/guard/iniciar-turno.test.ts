import { describe, expect, it, vi } from "vitest";

import { iniciarTurno } from "./iniciar-turno";
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

describe("iniciarTurno", () => {
  it("delega en el repositorio, pasando el sitioId elegido", async () => {
    const turno = buildTurno();
    const iniciar = vi.fn().mockResolvedValue(turno);
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar,
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    const result = await iniciarTurno({ turnoRepository }, "sitio-1");

    expect(iniciar).toHaveBeenCalledWith("sitio-1");
    expect(result).toEqual(turno);
  });

  it("propaga el error del repositorio si ya hay un turno activo", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn().mockRejectedValue(new Error("Ya tiene un turno activo.")),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn(),
    };

    await expect(iniciarTurno({ turnoRepository }, "sitio-1")).rejects.toThrow(/turno activo/i);
  });
});
