import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpEntryLogRepository } from "./http-entry-log-repository";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import { createCedula } from "@/domain/value-objects/cedula";

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
  fecha: "2026-01-01",
  horaEntrada: "08:00",
  horaSalida: "08:15",
  placa: "ABC123",
  nombreConductor: "Juan Pérez",
  cedula: "123456789",
  empresa: "Acme",
  motivo: "Entrega",
  localVisitado: "BAC",
  observaciones: "Sin novedad",
  fotos: [],
  createdAt: "2026-01-01T08:10:00.000Z",
};

describe("createHttpEntryLogRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("traduce la respuesta en español del backend a la entidad EntryLog en inglés", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_LOG]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpEntryLogRepository();
    const [log] = await repository.findBySite("sitio-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/bitacora/ingresos/sitio/sitio-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(log).toMatchObject({
      id: "log-1",
      sitioId: "sitio-1",
      guardId: "guard-1",
      date: "2026-01-01",
      entryTime: "08:00",
      exitTime: "08:15",
      plate: "ABC123",
      driverName: "Juan Pérez",
      cedula: "123456789",
      company: "Acme",
      reason: "Entrega",
      visitingLocal: "BAC",
      observations: "Sin novedad",
    });
  });

  it("consulta GET /bitacora/ingresos/guardia/:guardId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_LOG]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpEntryLogRepository();
    await repository.findByGuard("guard-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/bitacora/ingresos/guardia/guard-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
  });

  it("traduce los campos en inglés de EntryLog al body en español que espera el backend, sin enviar sitioId/guardId/turnoId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_LOG));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpEntryLogRepository();
    await repository.create({
      id: "ignored",
      sitioId: "ignored",
      guardId: "ignored",
      date: "2026-01-01",
      entryTime: "08:00",
      exitTime: "08:15",
      plate: createPlateNumber("ABC123"),
      driverName: "Juan Pérez",
      cedula: createCedula("123456789"),
      company: "Acme",
      reason: "Entrega",
      visitingLocal: "BAC",
      observations: "Sin novedad",
      photoUrls: [],
      createdAt: new Date(),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3002/bitacora/ingresos",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          fecha: "2026-01-01",
          horaEntrada: "08:00",
          horaSalida: "08:15",
          placa: "ABC123",
          nombreConductor: "Juan Pérez",
          cedula: "123456789",
          empresa: "Acme",
          motivo: "Entrega",
          localVisitado: "BAC",
          observaciones: "Sin novedad",
          fotos: undefined,
        }),
      }),
    );
  });
});
