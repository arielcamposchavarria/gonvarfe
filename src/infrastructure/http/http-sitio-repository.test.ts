import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpSitioRepository } from "./http-sitio-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpSitioRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna la lista de sitios tal como la envía el backend", async () => {
    const sitios = [
      {
        id: "1",
        nombre: "Plaza Amara",
        direccion: "San José",
        activo: true,
        marcas: [{ id: "m1", nombre: "BAC", qrCodeId: null }],
        locales: [{ id: "l1", nombre: "Panadería El Trigo" }],
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitios));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.findAll();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toEqual(sitios);
  });

  it("envía nombre/direccion/marcas y el Bearer token al crear un sitio", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockFetchResponse({ id: "2", nombre: "Plaza Nueva", direccion: "Cartago", activo: true, marcas: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await repository.create({ nombre: "Plaza Nueva", direccion: "Cartago", marcas: ["Marca A", "Marca B"] });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ nombre: "Plaza Nueva", direccion: "Cartago", marcas: ["Marca A", "Marca B"] }),
    });
  });

  it("envía nombre/direccion y el Bearer token al editar un sitio", async () => {
    const sitio = { id: "1", nombre: "Plaza Renovada", direccion: "Escazú", activo: true, marcas: [] };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.update("1", { nombre: "Plaza Renovada", direccion: "Escazú" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ nombre: "Plaza Renovada", direccion: "Escazú" }),
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al editarlo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.update("999", { nombre: "X", direccion: "Y" })).resolves.toBeNull();
  });

  it("llama al endpoint de desactivar sitio con el Bearer token", async () => {
    const sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: false, marcas: [] };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.deactivate("1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1/deactivate", {
      method: "PATCH",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al desactivarlo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.deactivate("999")).resolves.toBeNull();
  });

  it("retorna null si el sitio no existe al agregar una marca", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.addMarca("999", "BAC")).resolves.toBeNull();
  });

  it("llama al endpoint de generación de QR con el sitioId, marcaId y el Bearer token", async () => {
    const sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "BAC", qrCodeId: "qr-123" }],
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.generateMarcaQr("1", "m1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1/marcas/m1/qr", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al generar el QR", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.generateMarcaQr("999", "m1")).resolves.toBeNull();
  });

  it("envía el nombre y el Bearer token al editar una marca", async () => {
    const sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "BAC Credomatic", qrCodeId: null, activo: true }],
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.updateMarca("1", "m1", "BAC Credomatic");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1/marcas/m1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ nombre: "BAC Credomatic" }),
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al editar una marca", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.updateMarca("999", "m1", "X")).resolves.toBeNull();
  });

  it("llama al endpoint de desactivar marca con el Bearer token", async () => {
    const sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "BAC", qrCodeId: null, activo: false }],
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.deactivateMarca("1", "m1");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1/marcas/m1/deactivate", {
      method: "PATCH",
      headers: { Authorization: "Bearer test-token" },
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al desactivar una marca", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.deactivateMarca("999", "m1")).resolves.toBeNull();
  });

  it("envía el nombre y el Bearer token al crear un local", async () => {
    const sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [],
      locales: [{ id: "l1", nombre: "Panadería El Trigo" }],
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sitio));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    const result = await repository.createLocal("1", "Panadería El Trigo");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/sitios/1/locales", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ nombre: "Panadería El Trigo" }),
    });
    expect(result).toEqual(sitio);
  });

  it("retorna null si el sitio no existe al crear un local", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpSitioRepository();
    await expect(repository.createLocal("999", "Panadería El Trigo")).resolves.toBeNull();
  });
});
