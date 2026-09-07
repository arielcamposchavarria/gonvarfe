import { describe, expect, it } from "vitest";

import { updateProfileSchema } from "./update-profile-schema";

describe("updateProfileSchema", () => {
  it("acepta un nombre válido, recortando espacios", () => {
    const result = updateProfileSchema.safeParse({ name: "  Juan Pérez  " });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Juan Pérez");
  });

  it("rechaza un nombre vacío", () => {
    const result = updateProfileSchema.safeParse({ name: "   " });

    expect(result.success).toBe(false);
  });
});
