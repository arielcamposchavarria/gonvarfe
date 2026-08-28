import { describe, expect, it } from "vitest";

import { updateMarca } from "./update-marca";
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
    deactivate: async () => null,
    addMarca: async () => null,
    generateMarcaQr: async () => null,
    updateMarca: async (sitioId, marcaId, nombre) => {
      if (!sitio || sitio.id !== sitioId) return null;
      return { ...sitio, marcas: sitio.marcas.map((m) => (m.id === marcaId ? { ...m, nombre } : m)) };
    },
    deactivateMarca: async () => null,
    createLocal: async () => null,
  };
}

describe("updateMarca", () => {
  it("edita la marca y retorna el sitio actualizado", async () => {
    const sitio: Sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "BAC", orden: 1, qrCodeId: null, activo: true }],
      locales: [],
    };
    const sitioRepository = createRepository(sitio);

    const result = await updateMarca({ sitioRepository }, { sitioId: "1", marcaId: "m1", nombre: "BAC Credomatic" });

    expect(result.marcas[0].nombre).toBe("BAC Credomatic");
  });

  it("lanza SitioNotFoundError si el sitio no existe", async () => {
    const sitioRepository = createRepository(null);

    await expect(
      updateMarca({ sitioRepository }, { sitioId: "999", marcaId: "m1", nombre: "X" }),
    ).rejects.toBeInstanceOf(SitioNotFoundError);
  });
});
