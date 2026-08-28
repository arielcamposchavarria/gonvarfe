import { describe, expect, it, vi } from "vitest";

import { registrarEscaneo } from "./registrar-escaneo";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { Recorrido } from "@/domain/entities/recorrido";

function buildRecorrido(): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: "turno-1",
    sitioId: "sitio-1",
    secuencia: 1,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "en-progreso",
    completadoEn: null,
    registros: [],
  };
}

describe("registrarEscaneo", () => {
  it("reenvía qrValue y skip tal cual al repositorio, sin decidir a qué marca corresponde", async () => {
    const escanear = vi.fn().mockResolvedValue(buildRecorrido());
    const recorridoRepository: RecorridoRepository = {
      escanear,
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };

    await registrarEscaneo({ recorridoRepository }, { qrValue: "qr-abc", skip: false });
    expect(escanear).toHaveBeenCalledWith({ qrValue: "qr-abc", skip: false });

    await registrarEscaneo({ recorridoRepository }, { skip: true });
    expect(escanear).toHaveBeenCalledWith({ skip: true });
  });

  it("propaga el error del repositorio (p. ej. QR fuera de secuencia)", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn().mockRejectedValue(new Error("El código QR no corresponde a la marca esperada.")),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };

    await expect(registrarEscaneo({ recorridoRepository }, { qrValue: "qr-2", skip: false })).rejects.toThrow(
      /no corresponde a la marca esperada/,
    );
  });
});
