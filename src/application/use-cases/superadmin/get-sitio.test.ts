import { describe, expect, it } from "vitest";

import { getSitio } from "./get-sitio";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

describe("getSitio", () => {
  it("retorna el sitio si existe", async () => {
    const sitio: Sitio = { id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [] };
    const sitioRepository: SitioRepository = {
      findAll: async () => [sitio],
      findById: async (id) => (id === "1" ? sitio : null),
      create: async () => sitio,
      addMarca: async () => null,
      generateMarcaQr: async () => null,
    };

    await expect(getSitio({ sitioRepository }, "1")).resolves.toEqual(sitio);
  });

  it("retorna null si el sitio no existe", async () => {
    const sitioRepository: SitioRepository = {
      findAll: async () => [],
      findById: async () => null,
      create: async () => {
        throw new Error("no usado");
      },
      addMarca: async () => null,
      generateMarcaQr: async () => null,
    };

    await expect(getSitio({ sitioRepository }, "999")).resolves.toBeNull();
  });
});
