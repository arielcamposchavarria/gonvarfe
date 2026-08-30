import { describe, expect, it } from "vitest";

import { updateSitio } from "./update-sitio";
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
    update: async (sitioId, input) => {
      if (!sitio || sitio.id !== sitioId) return null;
      return { ...sitio, nombre: input.nombre, direccion: input.direccion };
    },
    deactivate: async () => null,
    addMarca: async () => null,
    generateMarcaQr: async () => null,
    updateMarca: async () => null,
    deactivateMarca: async () => null,
    createLocal: async () => null,
  };
}

describe("updateSitio", () => {
  it("edita el sitio y lo retorna", async () => {
    const sitio: Sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [], locales: [] };
    const sitioRepository = createRepository(sitio);

    const result = await updateSitio({ sitioRepository }, { sitioId: "1", nombre: "Plaza Renovada", direccion: "Escazú" });

    expect(result.nombre).toBe("Plaza Renovada");
    expect(result.direccion).toBe("Escazú");
  });

  it("lanza SitioNotFoundError si el sitio no existe", async () => {
    const sitioRepository = createRepository(null);

    await expect(
      updateSitio({ sitioRepository }, { sitioId: "999", nombre: "X", direccion: "Y" }),
    ).rejects.toBeInstanceOf(SitioNotFoundError);
  });
});
