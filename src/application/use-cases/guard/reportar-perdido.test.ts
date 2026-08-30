import { describe, expect, it, vi } from "vitest";

import { reportarPerdido } from "./reportar-perdido";
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

function buildRecorridoRepository(overrides: Partial<RecorridoRepository> = {}): RecorridoRepository {
  return {
    escanear: vi.fn(),
    reportarPerdido: vi.fn().mockResolvedValue(buildRecorrido()),
    activo: vi.fn(),
    porTurno: vi.fn(),
    porSitio: vi.fn(),
    porId: vi.fn(),
    ...overrides,
  };
}

describe("reportarPerdido", () => {
  it("envía el motivo recortado al repositorio", async () => {
    const recorridoRepository = buildRecorridoRepository();

    await reportarPerdido({ recorridoRepository }, { motivo: "  QR dañado, no se puede leer.  " });

    expect(recorridoRepository.reportarPerdido).toHaveBeenCalledWith(
      expect.objectContaining({ motivo: "QR dañado, no se puede leer." }),
    );
  });

  it("rechaza un motivo vacío sin llamar al repositorio", async () => {
    const recorridoRepository = buildRecorridoRepository();

    await expect(reportarPerdido({ recorridoRepository }, { motivo: "   " })).rejects.toThrow(/motivo/i);
    expect(recorridoRepository.reportarPerdido).not.toHaveBeenCalled();
  });

  it("reenvía fotos y observación junto con el motivo recortado", async () => {
    const recorridoRepository = buildRecorridoRepository();

    await reportarPerdido(
      { recorridoRepository },
      { motivo: "QR dañado", fotos: ["data:image/png;base64,foto1"], observacion: "Sin acceso" },
    );

    expect(recorridoRepository.reportarPerdido).toHaveBeenCalledWith({
      motivo: "QR dañado",
      fotos: ["data:image/png;base64,foto1"],
      observacion: "Sin acceso",
    });
  });
});
