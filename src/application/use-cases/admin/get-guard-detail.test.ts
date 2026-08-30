import { describe, expect, it, vi } from "vitest";

import { getGuardDetail } from "./get-guard-detail";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { GuardUser, AppUser } from "@/domain/entities/user";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Turno } from "@/domain/entities/turno";
import type { Sitio } from "@/domain/entities/sitio";
import type { EntryLog } from "@/domain/entities/entry-log";
import type { IncidentLog } from "@/domain/entities/incident-log";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";

const SITE_1: Sitio = { id: "site-1", nombre: "Plaza Amara", direccion: "N/A", activo: true, marcas: [], locales: [] };
const SITE_2: Sitio = {
  id: "site-2",
  nombre: "Planta Industrial Norte",
  direccion: "N/A",
  activo: true,
  marcas: [],
  locales: [],
};

const GUARD: GuardUser = {
  id: "guard-1",
  name: "Ana Pérez",
  username: "ana",
  role: "guard",
  isActive: true,
  createdAt: new Date("2025-01-01"),
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

function createFakeUserRepository(users: AppUser[]): UserRepository {
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
  };
}

function buildTurno(overrides: Partial<Turno>): Turno {
  return {
    id: "turno-1",
    guardiaId: GUARD.id,
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
    completadoEn: new Date("2026-01-01T08:30:00Z"),
    registros: [],
    ...overrides,
  };
}

describe("getGuardDetail", () => {
  it("suma los escaneos, recorridos y bitácoras del guard a través de todos sus turnos", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([
        buildTurno({ id: "turno-1", estado: "finalizado" }),
        buildTurno({ id: "turno-2", sitioId: SITE_2.id, estado: "activo", finalizadoEn: null }),
      ]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockImplementation(async (turnoId: string) => {
        if (turnoId === "turno-1") {
          return [
            buildRecorrido({
              id: "recorrido-1",
              turnoId: "turno-1",
              registros: [
                {
                  id: "registro-1",
                  marcaId: "marca-1",
                  orden: 1,
                  estado: "a-tiempo",
                  abreEn: new Date(),
                  cierraEn: new Date(),
                  escaneadoEn: new Date(),
                  motivoPerdido: null,
                },
                {
                  id: "registro-2",
                  marcaId: "marca-2",
                  orden: 2,
                  estado: "perdido",
                  abreEn: new Date(),
                  cierraEn: new Date(),
                  escaneadoEn: null,
                  motivoPerdido: "QR dañado",
                },
              ],
            }),
          ];
        }
        return [
          buildRecorrido({
            id: "recorrido-2",
            turnoId: "turno-2",
            sitioId: SITE_2.id,
            estado: "en-progreso",
            completadoEn: null,
            registros: [
              {
                id: "registro-3",
                marcaId: "marca-1",
                orden: 1,
                estado: "a-tiempo",
                abreEn: new Date(),
                cierraEn: new Date(),
                escaneadoEn: new Date(),
                motivoPerdido: null,
              },
            ],
          }),
        ];
      }),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const entryLog: EntryLog = {
      id: "entry-1",
      sitioId: SITE_1.id,
      guardId: GUARD.id,
      date: "2026-01-01",
      entryTime: "08:00",
      exitTime: "08:15",
      plate: createPlateNumber("ABC123"),
      driverName: "Juan Pérez",
      cedula: createCedula("123456789"),
      company: "Acme",
      reason: "Entrega",
      visitingLocal: "BAC",
      observations: "",
      photoUrls: [],
      createdAt: new Date("2026-01-01T08:10:00Z"),
    };
    const incidentLog: IncidentLog = {
      id: "incident-1",
      sitioId: SITE_1.id,
      guardId: GUARD.id,
      occurredAt: new Date("2026-01-01T08:20:00Z"),
      incidentType: "Otro",
      incidentTypeDetail: null,
      locationZone: "Entrada",
      description: "Sin novedad",
      photoUrls: [],
      createdAt: new Date("2026-01-01T08:20:00Z"),
    };
    const entryLogRepository: EntryLogRepository = {
      findBySite: vi.fn(),
      findByGuard: vi.fn().mockResolvedValue([entryLog]),
      create: vi.fn(),
    };
    const incidentLogRepository: IncidentLogRepository = {
      findBySite: vi.fn(),
      findByGuard: vi.fn().mockResolvedValue([incidentLog]),
      create: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE_1, SITE_2]);
    const userRepository = createFakeUserRepository([GUARD]);

    const detail = await getGuardDetail(
      { userRepository, sitioRepository, turnoRepository, recorridoRepository, entryLogRepository, incidentLogRepository },
      GUARD.id,
    );

    expect(detail?.currentSite?.id).toBe(SITE_2.id);
    expect(detail?.totals).toEqual({
      scansOnTime: 2,
      scansMissed: 1,
      roundsCompleted: 1,
      entryLogsCount: 1,
      incidentLogsCount: 1,
    });
  });

  it("no tiene sitio actual si el guard no tiene un turno activo", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockResolvedValue([]),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const entryLogRepository: EntryLogRepository = { findBySite: vi.fn(), findByGuard: vi.fn().mockResolvedValue([]), create: vi.fn() };
    const incidentLogRepository: IncidentLogRepository = {
      findBySite: vi.fn(),
      findByGuard: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    };
    const sitioRepository = createFakeSitioRepository([SITE_1]);
    const userRepository = createFakeUserRepository([GUARD]);

    const detail = await getGuardDetail(
      { userRepository, sitioRepository, turnoRepository, recorridoRepository, entryLogRepository, incidentLogRepository },
      GUARD.id,
    );

    expect(detail?.currentSite).toBeNull();
    expect(detail?.totals).toEqual({
      scansOnTime: 0,
      scansMissed: 0,
      roundsCompleted: 0,
      entryLogsCount: 0,
      incidentLogsCount: 0,
    });
  });

  it("devuelve null si el usuario no existe o no es un guard", async () => {
    const turnoRepository: TurnoRepository = {
      activo: vi.fn(),
      iniciar: vi.fn(),
      finalizar: vi.fn(),
      porGuardia: vi.fn().mockResolvedValue([]),
      porSitio: vi.fn(),
    };
    const recorridoRepository: RecorridoRepository = {
      escanear: vi.fn(),
      reportarPerdido: vi.fn(),
      activo: vi.fn(),
      porTurno: vi.fn().mockResolvedValue([]),
      porSitio: vi.fn(),
      porId: vi.fn(),
    };
    const entryLogRepository: EntryLogRepository = { findBySite: vi.fn(), findByGuard: vi.fn(), create: vi.fn() };
    const incidentLogRepository: IncidentLogRepository = { findBySite: vi.fn(), findByGuard: vi.fn(), create: vi.fn() };
    const sitioRepository = createFakeSitioRepository([SITE_1]);
    const admin: AppUser = {
      id: "admin-1",
      name: "Admin",
      username: "admin",
      role: "admin",
      isActive: true,
      createdAt: new Date("2025-01-01"),
    };
    const userRepository = createFakeUserRepository([admin]);
    const deps = { userRepository, sitioRepository, turnoRepository, recorridoRepository, entryLogRepository, incidentLogRepository };

    await expect(getGuardDetail(deps, "guard-missing")).resolves.toBeNull();
    await expect(getGuardDetail(deps, admin.id)).resolves.toBeNull();
  });
});
