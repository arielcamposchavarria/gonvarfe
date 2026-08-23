import { describe, expect, it } from "vitest";

import { createSiteSchema } from "./create-site-schema";

describe("createSiteSchema", () => {
  it("acepta datos válidos y separa las marcas por coma", () => {
    const result = createSiteSchema.safeParse({
      name: "Plaza Nueva",
      address: "San José",
      visitingLocals: "Marca A, Marca B,  Marca C ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitingLocals).toEqual(["Marca A", "Marca B", "Marca C"]);
    }
  });

  it("acepta una lista de marcas vacía", () => {
    const result = createSiteSchema.safeParse({ name: "Plaza Nueva", address: "San José", visitingLocals: "" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitingLocals).toEqual([]);
    }
  });

  it("rechaza si falta el nombre o la dirección", () => {
    expect(createSiteSchema.safeParse({ name: "", address: "San José", visitingLocals: "" }).success).toBe(false);
    expect(createSiteSchema.safeParse({ name: "Plaza Nueva", address: "", visitingLocals: "" }).success).toBe(false);
  });
});
