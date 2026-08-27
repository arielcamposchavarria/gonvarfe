import { describe, expect, it } from "vitest";

import { deactivateSitio } from "./deactivate-sitio";
import { SitioNotFoundError } from "./add-marca";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

function createRepository(sitio: Sitio | null): SitioRepository {
  return {
    findAll: async () => (sitio ? [sitio] : []),
    findById: async () => sitio,
    create: async () => {
      throw new Error("no usado");
    },
    update: async () => null,
    deactivate: async (sitioId) => {
      if (!sitio || sitio.id !== sitioId) return null;
      return { ...sitio, activo: false };
    },
    addMarca: async () => null,
    generateMarcaQr: async () => null,
    updateMarca: async () => null,
    deactivateMarca: async () => null,
    createLocal: async () => null,
  };
}

describe("deactivateSitio", () => {
  it("desactiva el sitio y lo retorna", async () => {
    const sitio: Sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [], locales: [] };
    const sitioRepository = createRepository(sitio);

    const result = await deactivateSitio({ sitioRepository }, "1");

    expect(result.activo).toBe(false);
  });

  it("lanza SitioNotFoundError si el sitio no existe", async () => {
    const sitioRepository = createRepository(null);

    await expect(deactivateSitio({ sitioRepository }, "999")).rejects.toBeInstanceOf(SitioNotFoundError);
  });
});
