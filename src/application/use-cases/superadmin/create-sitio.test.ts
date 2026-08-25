import { describe, expect, it } from "vitest";

import { createSitio } from "./create-sitio";
import type { CreateSitioInput, SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

describe("createSitio", () => {
  it("delega la creación al repositorio y retorna el sitio creado", async () => {
    const created: Sitio = {
      id: "1",
      nombre: "Plaza Nueva",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "Marca A", qrCodeId: null }],
      locales: [],
    };
    let receivedInput: CreateSitioInput | null = null;
    const sitioRepository: SitioRepository = {
      findAll: async () => [],
      findById: async () => null,
      create: async (input) => {
        receivedInput = input;
        return created;
      },
      addMarca: async () => null,
      generateMarcaQr: async () => null,
      createLocal: async () => null,
    };

    const input: CreateSitioInput = { nombre: "Plaza Nueva", direccion: "San José", marcas: ["Marca A"] };
    await expect(createSitio({ sitioRepository }, input)).resolves.toEqual(created);
    expect(receivedInput).toEqual(input);
  });
});
