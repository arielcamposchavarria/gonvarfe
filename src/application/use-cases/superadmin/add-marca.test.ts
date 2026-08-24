import { describe, expect, it } from "vitest";

import { addMarca, SitioNotFoundError } from "./add-marca";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

function createRepository(sitio: Sitio | null): SitioRepository {
  return {
    findAll: async () => (sitio ? [sitio] : []),
    findById: async () => sitio,
    create: async () => {
      throw new Error("no usado");
    },
    addMarca: async (sitioId, nombre) => {
      if (!sitio || sitio.id !== sitioId) return null;
      return { ...sitio, marcas: [...sitio.marcas, { id: "nueva", nombre, qrCodeId: null }] };
    },
    generateMarcaQr: async () => null,
  };
}

describe("addMarca", () => {
  it("agrega la marca al sitio y la retorna", async () => {
    const sitio: Sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [] };
    const sitioRepository = createRepository(sitio);

    const result = await addMarca({ sitioRepository }, { sitioId: "1", nombre: "BAC" });

    expect(result.marcas.map((m) => m.nombre)).toEqual(["BAC"]);
  });

  it("lanza SitioNotFoundError si el sitio no existe", async () => {
    const sitioRepository = createRepository(null);

    await expect(addMarca({ sitioRepository }, { sitioId: "999", nombre: "BAC" })).rejects.toBeInstanceOf(
      SitioNotFoundError,
    );
  });
});
