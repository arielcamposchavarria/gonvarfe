import { describe, expect, it } from "vitest";

import { listSitios } from "./list-sitios";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

function createMockRepository(sitios: Sitio[]): SitioRepository {
  return {
    findAll: async () => sitios,
    findById: async () => null,
    create: async () => sitios[0],
    addMarca: async () => null,
    generateMarcaQr: async () => null,
  };
}

describe("listSitios", () => {
  it("retorna todos los sitios del repositorio", async () => {
    const sitios: Sitio[] = [{ id: "1", nombre: "Plaza Amara", direccion: "San José", activo: true, marcas: [] }];
    const sitioRepository = createMockRepository(sitios);

    await expect(listSitios({ sitioRepository })).resolves.toEqual(sitios);
  });
});
