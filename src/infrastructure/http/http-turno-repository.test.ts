import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpTurnoRepository } from "./http-turno-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    // Nest envía un body real vacío (no el string "null") cuando el
    // controller retorna null — reproducimos eso para que el mock no
    // oculte bugs que solo aparecen contra el servidor real.
    text: async () => (body === null || body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

const BACKEND_TURNO = {
  id: "turno-1",
  guardiaId: "guard-1",
  sitioId: "sitio-1",
  iniciadoEn: "2026-01-01T08:00:00.000Z",
  estado: "activo",
  finalizadoEn: null,
};

describe("createHttpTurnoRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("consulta GET /turnos/activo y convierte las fechas a Date", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_TURNO));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    const result = await repository.activo();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos/activo", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result?.iniciadoEn).toEqual(new Date("2026-01-01T08:00:00.000Z"));
    expect(result?.finalizadoEn).toBeNull();
  });

  it("retorna null si no hay turno activo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    await expect(repository.activo()).resolves.toBeNull();
  });

  it("envía el sitioId y el Bearer token al iniciar un turno", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_TURNO));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    await repository.iniciar("sitio-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ sitioId: "sitio-1" }),
    });
  });

  it("lanza un error legible en español si ya hay un turno activo (409)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 409));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    await expect(repository.iniciar("sitio-1")).rejects.toThrow(/turno activo/i);
  });

  it("llama PATCH /turnos/:id/finalizar", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse({ ...BACKEND_TURNO, estado: "finalizado" }));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    const result = await repository.finalizar("turno-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos/turno-1/finalizar", {
      method: "PATCH",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(result.estado).toBe("finalizado");
  });

  it("lanza un error legible en español si hay un recorrido en progreso al finalizar (409)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 409));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    await expect(repository.finalizar("turno-1")).rejects.toThrow(/recorrido en curso/i);
  });

  it("llama PATCH /turnos/:id/forzar-finalizar", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse({ ...BACKEND_TURNO, estado: "finalizado" }));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    const result = await repository.forzarFinalizar("turno-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos/turno-1/forzar-finalizar", {
      method: "PATCH",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(result.estado).toBe("finalizado");
  });

  it("lanza un error legible en español si el turno ya estaba finalizado (409)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 409));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    await expect(repository.forzarFinalizar("turno-1")).rejects.toThrow(/ya está finalizado/i);
  });

  it("consulta GET /turnos/guardia/:id para reportes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_TURNO]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    const result = await repository.porGuardia("guard-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos/guardia/guard-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toHaveLength(1);
  });

  it("consulta GET /turnos/sitio/:id para reportes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_TURNO]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpTurnoRepository();
    const result = await repository.porSitio("sitio-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/turnos/sitio/sitio-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toHaveLength(1);
  });
});
