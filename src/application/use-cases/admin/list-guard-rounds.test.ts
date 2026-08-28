import { describe, expect, it, vi } from "vitest";

import { listGuardRounds } from "./list-guard-rounds";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Turno } from "@/domain/entities/turno";
import type { Sitio } from "@/domain/entities/sitio";

const SITE_1: Sitio = { id: "site-1", nombre: "Plaza Amara", direccion: "N/A", activo: true, marcas: [], locales: [] };
const SITE_2: Sitio = {
  id: "site-2",
  nombre: "Planta Industrial Norte",
  direccion: "N/A",
  activo: true,
  marcas: [],
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

function buildTurno(overrides: Partial<Turno>): Turno {
  return {
    id: "turno-1",
    guardiaId: "guard-1",
    sitioId: SITE_1.id,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "finalizado",
    finalizadoEn: new Date("2026-01-01T09:00:00Z"),
    ...overrides,
  };
}

function buildRecorrido(overrides: Partial<Recorrido>): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: "turno-1",
    sitioId: SITE_1.id,
    secuencia: 1,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "completado",
    completadoEn: new Date("2026-01-01T09:00:00Z"),
    registros: [],
    ...overrides,
  };
}

describe("listGuardRounds", () => {
  it("junta los recorridos de todos los turnos del guard, con el sitio de origen, del más reciente al más antiguo", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi
        .fn()
        .mockResolvedValue([buildTurno({ id: "turno-1", sitioId: SITE_1.id }), buildTurno({ id: "turno-2", sitioId: SITE_2.id })]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockImplementation(async (turnoId: string) =>
        turnoId === "turno-1"
          ? [buildRecorrido({ id: "recorrido-1", turnoId: "turno-1", sitioId: SITE_1.id, iniciadoEn: new Date("2026-01-01T08:00:00Z") })]
          : [buildRecorrido({ id: "recorrido-2", turnoId: "turno-2", sitioId: SITE_2.id, iniciadoEn: new Date("2026-01-02T08:00:00Z") })],
      ),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE_1, SITE_2]);

    const result = await listGuardRounds({ turnoRepository, recorridoRepository, sitioRepository }, "guard-1");

    expect(result.map((r) => r.recorrido.id)).toEqual(["recorrido-2", "recorrido-1"]);
    expect(result[0].siteName).toBe("Planta Industrial Norte");
    expect(result[1].siteName).toBe("Plaza Amara");
  });

  it("filtra por el rango de fechas de inicio del recorrido", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([buildTurno({})]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockResolvedValue([
        buildRecorrido({ id: "recorrido-fuera", iniciadoEn: new Date("2025-12-31T08:00:00Z") }),
        buildRecorrido({ id: "recorrido-dentro", iniciadoEn: new Date("2026-01-05T08:00:00Z") }),
      ]),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE_1]);

    const result = await listGuardRounds({ turnoRepository, recorridoRepository, sitioRepository }, "guard-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((r) => r.recorrido.id)).toEqual(["recorrido-dentro"]);
  });
});
