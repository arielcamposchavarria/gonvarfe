import { describe, expect, it } from "vitest";

import { createGuardSchema } from "./create-guard-schema";

describe("createGuardSchema", () => {
  it("acepta datos válidos, sin pedir sitio (el guard elige el sitio al iniciar turno)", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "clave123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un username con espacios o caracteres inválidos", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana rojas!",
      password: "clave123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = createGuardSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});
