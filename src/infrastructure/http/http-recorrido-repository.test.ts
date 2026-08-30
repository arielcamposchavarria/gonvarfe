import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpRecorridoRepository } from "./http-recorrido-repository";

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

const BACKEND_RECORRIDO = {
  id: "recorrido-1",
  turnoId: "turno-1",
  sitioId: "sitio-1",
  secuencia: 1,
  iniciadoEn: "2026-01-01T08:00:00.000Z",
  estado: "en-progreso",
  completadoEn: null,
  registros: [
    {
      id: "registro-1",
      marcaId: "marca-1",
      orden: 1,
      estado: "pendiente",
      abreEn: "2026-01-01T08:00:00.000Z",
      cierraEn: "2026-01-01T08:02:00.000Z",
      escaneadoEn: null,
      motivoPerdido: null,
    },
  ],
  completado: false,
};

describe("createHttpRecorridoRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envía qrValue y skip al escanear, con el Bearer token, y convierte las fechas de los registros", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_RECORRIDO));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    const result = await repository.escanear({ qrValue: "qr-abc", skip: false });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/recorridos/escanear", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ qrValue: "qr-abc", skip: false }),
    });
    expect(result.registros[0].abreEn).toEqual(new Date("2026-01-01T08:00:00.000Z"));
  });

  it("traduce QrInvalidoException (409) a un mensaje distinto de VentanaAunNoAbreException", async () => {
    const qrFetchMock = vi
      .fn()
      .mockResolvedValue(mockFetchResponse({ statusCode: 409, message: "x", error: "QrInvalidoException" }, 409));
    vi.stubGlobal("fetch", qrFetchMock);
    const repository = createHttpRecorridoRepository();

    let qrError: Error | undefined;
    try {
      await repository.escanear({ qrValue: "qr-equivocado", skip: false });
    } catch (error) {
      qrError = error as Error;
    }
    expect(qrError?.message).toMatch(/orden del recorrido/i);

    vi.unstubAllGlobals();
    const windowFetchMock = vi
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ statusCode: 409, message: "x", error: "VentanaAunNoAbreException" }, 409),
      );
    vi.stubGlobal("fetch", windowFetchMock);

    let windowError: Error | undefined;
    try {
      await repository.escanear({ qrValue: "qr-abc", skip: false });
    } catch (error) {
      windowError = error as Error;
    }
    expect(windowError?.message).toMatch(/ventana/i);
    expect(windowError?.message).not.toEqual(qrError?.message);
  });

  it("lanza un error legible si no hay turno activo (404)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    await expect(repository.escanear({ skip: true })).rejects.toThrow(/turno activo/i);
  });

  it("envía el motivo al reportar perdido", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(BACKEND_RECORRIDO));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    await repository.reportarPerdido("QR dañado");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/recorridos/reportar-perdido", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ motivo: "QR dañado" }),
    });
  });

  it("consulta GET /recorridos/activo y retorna null si no hay uno", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    await expect(repository.activo()).resolves.toBeNull();
  });

  it("consulta GET /recorridos/turno/:turnoId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_RECORRIDO]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    const result = await repository.porTurno("turno-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/recorridos/turno/turno-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toHaveLength(1);
  });

  it("consulta GET /recorridos/sitio/:sitioId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([BACKEND_RECORRIDO]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    await repository.porSitio("sitio-1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/recorridos/sitio/sitio-1", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
  });

  it("retorna null si el recorrido no existe (404)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRecorridoRepository();
    await expect(repository.porId("no-existe")).resolves.toBeNull();
  });
});
