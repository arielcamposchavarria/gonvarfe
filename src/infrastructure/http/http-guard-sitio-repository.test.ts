import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpGuardSitioRepository } from "./http-guard-sitio-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpGuardSitioRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("consulta GET /sitios/guard con el Bearer token y retorna los sitios tal como los envía el backend", async () => {
    const sitios = [
      {
        id: "1",
        nombre: "Plaza Amara",
        direccion: "San José",
        marcas: [{ id: "m1", nombre: "BAC", orden: 1, activo: true }],
        locales: [{ id: "l1", nombre: "Panadería El Trigo" }],
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitios));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpGuardSitioRepository();
    const result = await repository.findAll();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/guard", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toEqual(sitios);
    expect((result[0].marcas[0] as unknown as { qrCodeId?: string }).qrCodeId).toBeUndefined();
  });

  it("lanza un error si el backend responde con un status distinto de 2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 500));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpGuardSitioRepository();
    await expect(repository.findAll()).rejects.toThrow(/no se pudieron obtener/i);
  });
});
