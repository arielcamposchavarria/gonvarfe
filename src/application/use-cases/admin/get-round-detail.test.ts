import { describe, expect, it, vi } from "vitest";

import { getRoundDetail } from "./get-round-detail";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Turno } from "@/domain/entities/turno";
import type { Sitio } from "@/domain/entities/sitio";

const SITE: Sitio = { id: "site-1", nombre: "Sitio de prueba", direccion: "N/A", activo: true, marcas: [], locales: [] };

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

const RECORRIDO: Recorrido = {
  id: "recorrido-1",
  turnoId: "turno-1",
  sitioId: SITE.id,
  secuencia: 1,
  iniciadoEn: new Date("2026-01-01T08:00:00Z"),
  estado: "completado",
  completadoEn: new Date("2026-01-01T09:00:00Z"),
  registros: [],
};

const TURNO: Turno = {
  id: "turno-1",
  guardiaId: GUARD.id,
  sitioId: SITE.id,
  iniciadoEn: new Date("2026-01-01T08:00:00Z"),
  estado: "finalizado",
  finalizadoEn: new Date("2026-01-01T09:00:00Z"),
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

function createFakeUserRepository(users: GuardUser[]): UserRepository {
  return {
    async findAll() {
      return users;
    },
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async findByRole(role) {
      return users.filter((user) => user.role === role);
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
    async assignSite() {
      throw new Error("No usado en esta prueba.");
    },
  };
}

describe("getRoundDetail", () => {
  it("devuelve el recorrido, el sitio y el nombre del guarda responsable", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn(),
      porId: vi.fn().mockResolvedValue(RECORRIDO),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([TURNO]),
    };
    const sitioRepository = createFakeSitioRepository([SITE]);
    const userRepository = createFakeUserRepository([GUARD]);

    const detail = await getRoundDetail(
      { recorridoRepository, turnoRepository, sitioRepository, userRepository },
      SITE.id,
      RECORRIDO.id,
    );

    expect(detail?.recorrido.id).toBe(RECORRIDO.id);
    expect(detail?.sitio.id).toBe(SITE.id);
    expect(detail?.guardName).toBe("Ana Pérez");
    expect(detail?.turnoId).toBe(TURNO.id);
    expect(detail?.turnoIniciadoEn).toEqual(TURNO.iniciadoEn);
  });

  it("devuelve null si el recorrido no existe o pertenece a otro sitio", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn(),
      porId: vi.fn().mockResolvedValue(RECORRIDO),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      forzarFinalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([TURNO]),
    };
    const sitioRepository = createFakeSitioRepository([SITE]);
    const userRepository = createFakeUserRepository([GUARD]);
    const deps = { recorridoRepository, turnoRepository, sitioRepository, userRepository };

    await expect(getRoundDetail(deps, "site-2", RECORRIDO.id)).resolves.toBeNull();

    const missingRepository: RecorridoRepository = { ...recorridoRepository, porId: vi.fn().mockResolvedValue(null) };
    await expect(
      getRoundDetail({ ...deps, recorridoRepository: missingRepository }, SITE.id, "recorrido-missing"),
    ).resolves.toBeNull();
  });
});
