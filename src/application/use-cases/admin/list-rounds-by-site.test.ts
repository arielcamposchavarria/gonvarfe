import { describe, expect, it, vi } from "vitest";

import { listRoundsBySite } from "./list-rounds-by-site";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Turno } from "@/domain/entities/turno";

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

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

function buildRecorrido(overrides: Partial<Recorrido>): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: "turno-1",
    sitioId: "site-1",
    secuencia: 1,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "completado",
    completadoEn: new Date("2026-01-01T09:00:00Z"),
    registros: [],
    ...overrides,
  };
}

function buildTurno(overrides: Partial<Turno>): Turno {
  return {
    id: "turno-1",
    guardiaId: GUARD.id,
    sitioId: "site-1",
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "finalizado",
    finalizadoEn: null,
    ...overrides,
  };
}

describe("listRoundsBySite", () => {
  it("ordena los recorridos del sitio del más reciente (o en curso) al más antiguo, con el nombre del guarda", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([
        buildRecorrido({ id: "recorrido-1", secuencia: 1, iniciadoEn: new Date("2026-01-01T08:00:00Z") }),
        buildRecorrido({
          id: "recorrido-2",
          secuencia: 2,
          iniciadoEn: new Date("2026-01-01T09:00:00Z"),
          estado: "en-progreso",
          completadoEn: null,
        }),
      ]),
      porId: vi.fn(),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([buildTurno({})]),
    };
    const userRepository = createFakeUserRepository([GUARD]);

    const result = await listRoundsBySite({ recorridoRepository, turnoRepository, userRepository }, "site-1");

    expect(result.map((r) => r.recorrido.id)).toEqual(["recorrido-2", "recorrido-1"]);
    expect(result[0].guardName).toBe("Ana Pérez");
  });

  it("filtra por el rango de fechas de INICIO DEL TURNO, no del recorrido individual", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([
        buildRecorrido({ id: "recorrido-fuera", turnoId: "turno-fuera", iniciadoEn: new Date("2025-12-31T08:00:00Z") }),
        buildRecorrido({ id: "recorrido-dentro", turnoId: "turno-dentro", iniciadoEn: new Date("2026-01-05T08:00:00Z") }),
      ]),
      porId: vi.fn(),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([
        buildTurno({ id: "turno-fuera", iniciadoEn: new Date("2025-12-31T08:00:00Z") }),
        buildTurno({ id: "turno-dentro", iniciadoEn: new Date("2026-01-05T08:00:00Z") }),
      ]),
    };
    const userRepository = createFakeUserRepository([GUARD]);

    const result = await listRoundsBySite({ recorridoRepository, turnoRepository, userRepository }, "site-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result.map((r) => r.recorrido.id)).toEqual(["recorrido-dentro"]);
  });

  it("mantiene junto un turno completo aunque uno de sus recorridos haya arrancado pasada la medianoche", async () => {
    // El turno empezó el 31/12 a las 23:50 (fuera del rango 2026-01-01..31);
    // su segundo recorrido arrancó ya el 1/1. Como el filtro es por el
    // inicio del TURNO, ambos recorridos deben excluirse igual.
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([
        buildRecorrido({ id: "recorrido-1", turnoId: "turno-medianoche", iniciadoEn: new Date("2025-12-31T23:50:00Z") }),
        buildRecorrido({ id: "recorrido-2", turnoId: "turno-medianoche", iniciadoEn: new Date("2026-01-01T00:30:00Z") }),
      ]),
      porId: vi.fn(),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([buildTurno({ id: "turno-medianoche", iniciadoEn: new Date("2025-12-31T23:50:00Z") })]),
    };
    const userRepository = createFakeUserRepository([GUARD]);

    const result = await listRoundsBySite({ recorridoRepository, turnoRepository, userRepository }, "site-1", {
      from: new Date("2026-01-01T00:00:00"),
      to: new Date("2026-01-31T23:59:59"),
    });

    expect(result).toEqual([]);
  });

  it("retorna 'Guarda desconocido' si no encuentra el turno correspondiente", async () => {
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([buildRecorrido({ turnoId: "turno-huerfano" })]),
      porId: vi.fn(),
    };
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn(),
      porSitio: vi.fn().mockResolvedValue([]),
    };
    const userRepository = createFakeUserRepository([GUARD]);

    const result = await listRoundsBySite({ recorridoRepository, turnoRepository, userRepository }, "site-1");

    expect(result[0].guardName).toBe("Guarda desconocido");
  });
});
