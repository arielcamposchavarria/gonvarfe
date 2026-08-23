import { describe, expect, it } from "vitest";

import { createGuardSchema } from "./create-guard-schema";

describe("createGuardSchema", () => {
  it("acepta datos válidos", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "clave123",
      assignedSiteId: "site-1",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un username con espacios o caracteres inválidos", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana rojas!",
      password: "clave123",
      assignedSiteId: "site-1",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "123",
      assignedSiteId: "site-1",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza si no se selecciona un sitio", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "clave123",
      assignedSiteId: "",
    });
    expect(result.success).toBe(false);
  });
});
