import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpIncidentLogRepository } from "./http-incident-log-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const BACKEND_LOG = {
  id: "log-1",
  turnoId: "turno-1",
  sitioId: "sitio-1",
  guardiaId: "guard-1",
  ocurrioEn: "2026-01-01T08:20:00.000Z",
  tipoIncidente: "Otro",
  detalleTipoIncidente: "Fuga de agua",
  zonaUbicacion: "Entrada",
  descripcion: "Sin novedad",
  fotos: [],
  createdAt: "2026-01-01T08:20:00.000Z",
};

describe("createHttpIncidentLogRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("traduce la respuesta en español del backend a la entidad IncidentLog en inglés", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_LOG]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpIncidentLogRepository();
    const [log] = await repository.findBySite("sitio-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/bitacora/incidencias/sitio/sitio-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(log).toMatchObject({
      id: "log-1",
      sitioId: "sitio-1",
      guardId: "guard-1",
      incidentType: "Otro",
      incidentTypeDetail: "Fuga de agua",
      locationZone: "Entrada",
      description: "Sin novedad",
    });
    expect(log.occurredAt).toEqual(new Date("2026-01-01T08:20:00.000Z"));
  });

  it("consulta GET /bitacora/incidencias/guardia/:guardId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_LOG]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpIncidentLogRepository();
    await repository.findByGuard("guard-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/bitacora/incidencias/guardia/guard-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
  });

  it("traduce los campos en inglés de IncidentLog al body en español que espera el backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_LOG));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpIncidentLogRepository();
    await repository.create({
      id: "ignored",
      sitioId: "ignored",
      guardId: "ignored",
      occurredAt: new Date("2026-01-01T08:20:00.000Z"),
      incidentType: "Otro",
      incidentTypeDetail: "Fuga de agua",
      locationZone: "Entrada",
      description: "Sin novedad",
      photoUrls: [],
      createdAt: new Date(),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3002/bitacora/incidencias",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          ocurrioEn: new Date("2026-01-01T08:20:00.000Z").toISOString(),
          tipoIncidente: "Otro",
          detalleTipoIncidente: "Fuga de agua",
          zonaUbicacion: "Entrada",
          descripcion: "Sin novedad",
          fotos: undefined,
        }),
      }),
    );
  });
});
