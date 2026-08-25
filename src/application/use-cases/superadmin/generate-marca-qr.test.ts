import { describe, expect, it } from "vitest";

import { generateMarcaQr } from "./generate-marca-qr";
import { SitioNotFoundError } from "./add-marca";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

describe("generateMarcaQr", () => {
  it("retorna el sitio con el qrCodeId generado por el repositorio", async () => {
    const sitio: Sitio = {
      id: "1",
      nombre: "Plaza Amara",
      direccion: "San José",
      activo: true,
      marcas: [{ id: "m1", nombre: "BAC", qrCodeId: "qr-123" }],
      locales: [],
    };
    const sitioRepository: SitioRepository = {
      findAll: async () => [sitio],
      findById: async () => sitio,
      create: async () => sitio,
      addMarca: async () => null,
      createLocal: async () => null,
      generateMarcaQr: async () => sitio,
    };

    await expect(generateMarcaQr({ sitioRepository }, { sitioId: "1", marcaId: "m1" })).resolves.toEqual(sitio);
  });

  it("lanza SitioNotFoundError si el repositorio retorna null", async () => {
    const sitioRepository: SitioRepository = {
      findAll: async () => [],
      findById: async () => null,
      create: async () => {
        throw new Error("no usado");
      },
      addMarca: async () => null,
      createLocal: async () => null,
      generateMarcaQr: async () => null,
    };

    await expect(
      generateMarcaQr({ sitioRepository }, { sitioId: "999", marcaId: "m1" }),
    ).rejects.toBeInstanceOf(SitioNotFoundError);
  });
});
