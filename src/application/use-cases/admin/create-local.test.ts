import { describe, expect, it } from "vitest";

import { createLocal, SitioNotFoundError } from "./create-local";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

function createRepository(sitio: Sitio | null): SitioRepository {
  return {
    findAll: async () => (sitio ? [sitio] : []),
    findById: async () => sitio,
    create: async () => {
      throw new Error("no usado");
    },
    addMarca: async () => null,
    generateMarcaQr: async () => null,
    createLocal: async (sitioId, nombre) => {
      if (!sitio || sitio.id !== sitioId) return null;
      return { ...sitio, locales: [...sitio.locales, { id: "nuevo", nombre }] };
    },
  };
}

describe("createLocal", () => {
  it("agrega el local al sitio y lo retorna", async () => {
    const sitio: Sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [], locales: [] };
    const sitioRepository = createRepository(sitio);

    const result = await createLocal({ sitioRepository }, { sitioId: "1", nombre: "Panadería El Trigo" });

    expect(result.locales.map((l) => l.nombre)).toEqual(["Panadería El Trigo"]);
  });

  it("lanza SitioNotFoundError si el sitio no existe", async () => {
    const sitioRepository = createRepository(null);

    await expect(
      createLocal({ sitioRepository }, { sitioId: "999", nombre: "Panadería El Trigo" }),
    ).rejects.toBeInstanceOf(SitioNotFoundError);
  });
});
