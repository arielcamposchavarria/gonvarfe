import { describe, expect, it } from "vitest";

import { createUserSchema } from "./create-user-schema";

describe("createUserSchema", () => {
  it("acepta datos válidos para cualquier rol, sin pedir sitio", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "clave123",
      role: "guard",
    });
    expect(result.success).toBe(true);
  });

  it("acepta un admin sin pedir sitio", () => {
    const result = createUserSchema.safeParse({
      name: "Luis Herrera",
      username: "luis.herrera",
      password: "clave123",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un rol inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "clave123",
      role: "inventado",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      password: "123",
      role: "guard",
    });
    expect(result.success).toBe(false);
  });
});
