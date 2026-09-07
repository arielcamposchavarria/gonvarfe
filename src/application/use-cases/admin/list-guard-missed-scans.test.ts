import { describe, expect, it, vi } from "vitest";

import { listGuardMissedScans } from "./list-guard-missed-scans";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Registro } from "@/domain/entities/registro";
import type { Turno } from "@/domain/entities/turno";
import type { Sitio } from "@/domain/entities/sitio";

const SITE: Sitio = {
  id: "site-1",
  nombre: "Plaza Amara",
  direccion: "N/A",
  activo: true,
  marcas: [
    { id: "marca-1", nombre: "Entrada principal", orden: 1, qrCodeId: null, activo: true },
    { id: "marca-2", nombre: "Área de carga", orden: 2, qrCodeId: null, activo: true },
  ],
  locales: [],
};

function createFakeSitioRepository(sitios: Sitio[]): SitioRepository {
  return {
    async findAll() {
      return sitios;
    },
    async findById(id) {
      return sitios.find((sitio) => sitio.id === id) ?? null;
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
    async update() {
      return null;
    },
    async deactivate() {
      return null;
    },
    async addMarca() {
      return null;
    },
    async generateMarcaQr() {
      return null;
    },
    async updateMarca() {
      return null;
    },
    async deactivateMarca() {
      return null;
    },
    async createLocal() {
      return null;
    },
  };
}

function buildRegistro(overrides: Partial<Registro>): Registro {
  return {
    id: crypto.randomUUID(),
    marcaId: "marca-1",
    orden: 1,
    estado: "a-tiempo",
    abreEn: new Date("2026-01-01T08:00:00Z"),
    cierraEn: new Date("2026-01-01T08:02:00Z"),
    escaneadoEn: new Date("2026-01-01T08:01:00Z"),
    motivoPerdido: null,
    fotos: null,
    observacion: null,
    ...overrides,
  };
}

function buildRecorrido(overrides: Partial<Recorrido>): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: "turno-1",
    sitioId: SITE.id,
    secuencia: 1,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "completado",
    completadoEn: new Date("2026-01-01T09:00:00Z"),
    registros: [],
    ...overrides,
  };
}

const TURNO: Turno = {
  id: "turno-1",
  guardiaId: "guard-1",
  sitioId: SITE.id,
  iniciadoEn: new Date("2026-01-01T08:00:00Z"),
  estado: "finalizado",
  finalizadoEn: new Date("2026-01-01T09:00:00Z"),
};

describe("listGuardMissedScans", () => {
  it("devuelve las marcas no escaneadas con su motivo, sitio y marca, de la más reciente a la más antigua", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([TURNO]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockResolvedValue([
        buildRecorrido({
          registros: [
            buildRegistro({ id: "r1", marcaId: "marca-1", estado: "a-tiempo" }),
            buildRegistro({
              id: "r2",
              marcaId: "marca-2",
              estado: "perdido",
              escaneadoEn: null,
              cierraEn: new Date("2026-01-01T08:15:00Z"),
              motivoPerdido: "QR dañado, no se puede leer.",
              fotos: ["data:image/png;base64,foto1"],
              observacion: "Sin acceso al área",
            }),
          ],
        }),
      ]),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE]);

    const result = await listGuardMissedScans({ turnoRepository, recorridoRepository, sitioRepository }, "guard-1");

    expect(result).toEqual([
      {
        siteName: "Plaza Amara",
        stationName: "Área de carga",
        roundSequence: 1,
        reason: "QR dañado, no se puede leer.",
        reportedAt: new Date("2026-01-01T08:15:00Z"),
        fotos: ["data:image/png;base64,foto1"],
        observacion: "Sin acceso al área",
      },
    ]);
  });

  it("filtra por el rango de fechas del cierre de ventana", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([TURNO]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockResolvedValue([
        buildRecorrido({
          registros: [
            buildRegistro({
              id: "r-fuera",
              estado: "perdido",
              escaneadoEn: null,
              cierraEn: new Date("2025-12-31T08:00:00Z"),
              motivoPerdido: "Fuera de rango",
            }),
            buildRegistro({
              id: "r-dentro",
              marcaId: "marca-2",
              estado: "perdido",
              escaneadoEn: null,
              cierraEn: new Date("2026-01-05T08:00:00Z"),
              motivoPerdido: "Dentro de rango",
            }),
          ],
        }),
      ]),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE]);

    const result = await listGuardMissedScans({ turnoRepository, recorridoRepository, sitioRepository }, "guard-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((entry) => entry.reason)).toEqual(["Dentro de rango"]);
  });
});
