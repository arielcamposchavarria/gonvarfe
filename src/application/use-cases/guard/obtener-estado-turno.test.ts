import { describe, expect, it, vi } from "vitest";

import { obtenerEstadoTurno } from "./obtener-estado-turno";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { GuardSitioRepository } from "@/domain/ports/guard-sitio-repository";
import type { Turno } from "@/domain/entities/turno";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

const TURNO: Turno = {
  id: "turno-1",
  guardiaId: "guard-1",
  sitioId: "sitio-1",
  iniciadoEn: new Date("2026-01-01T08:00:00Z"),
  estado: "activo",
  finalizadoEn: null,
};

const SITIO: GuardSitio = {
  id: "sitio-1",
  nombre: "Plaza Amara",
  direccion: "San José",
  marcas: [{ id: "m1", nombre: "BAC", orden: 1, activo: true }],
  locales: [],
};

function buildRecorrido(overrides: Partial<Recorrido> = {}): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: TURNO.id,
    sitioId: SITIO.id,
    secuencia: 1,
    iniciadoEn: new Date("2026-01-01T08:00:00Z"),
    estado: "en-progreso",
    completadoEn: null,
    registros: [],
    ...overrides,
  };
}

function buildDeps(overrides: {
  turno?: Turno | null;
  sitios?: GuardSitio[];
  recorridos?: Recorrido[];
  recorridoActivo?: Recorrido | null;
}) {
  const turnoRepository: TurnoRepository = {
    activo: vi.fn().mockResolvedValue(overrides.turno ?? null),
    iniciar: vi.fn(),
    finalizar: vi.fn(),
    porGuardia: vi.fn(),
    porSitio: vi.fn(),
  };
  const recorridoRepository: RecorridoRepository = {
    escanear: vi.fn(),
    reportarPerdido: vi.fn(),
    activo: vi.fn().mockResolvedValue(overrides.recorridoActivo ?? null),
    porTurno: vi.fn().mockResolvedValue(overrides.recorridos ?? []),
    porSitio: vi.fn(),
    porId: vi.fn(),
  };
  const guardSitioRepository: GuardSitioRepository = {
    findAll: vi.fn().mockResolvedValue(overrides.sitios ?? []),
  };
  return { turnoRepository, recorridoRepository, guardSitioRepository };
}

describe("obtenerEstadoTurno", () => {
  it("retorna todo en null/0 si no hay turno activo, sin consultar sitio ni recorridos", async () => {
    const deps = buildDeps({ turno: null });

    const estado = await obtenerEstadoTurno(deps);

    expect(estado).toEqual({ turno: null, sitio: null, recorridoActivo: null, recorridosCompletados: 0 });
    expect(deps.guardSitioRepository.findAll).not.toHaveBeenCalled();
  });

  it("arma el sitio real, el recorrido activo y el conteo de recorridos completados", async () => {
    const recorridoActivo = buildRecorrido({ id: "recorrido-2", secuencia: 2 });
    const deps = buildDeps({
      turno: TURNO,
      sitios: [SITIO],
      recorridos: [buildRecorrido({ estado: "completado" }), recorridoActivo],
      recorridoActivo,
    });

    const estado = await obtenerEstadoTurno(deps);

    expect(estado.turno).toEqual(TURNO);
    expect(estado.sitio).toEqual(SITIO);
    expect(estado.recorridoActivo).toEqual(recorridoActivo);
    expect(estado.recorridosCompletados).toBe(1);
  });

  it("deja el sitio en null si el turno apunta a un sitio que ya no está activo", async () => {
    const deps = buildDeps({ turno: TURNO, sitios: [], recorridos: [], recorridoActivo: null });

    const estado = await obtenerEstadoTurno(deps);

    expect(estado.sitio).toBeNull();
  });
});
