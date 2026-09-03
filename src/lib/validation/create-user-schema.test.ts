import { describe, expect, it } from "vitest";

import { createUserSchema } from "./create-user-schema";

describe("createUserSchema", () => {
  it("acepta datos válidos para cualquier rol, sin pedir sitio", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      email: "ana.rojas@example.com",
      role: "guard",
    });
    expect(result.success).toBe(true);
  });

  it("acepta un admin sin pedir sitio", () => {
    const result = createUserSchema.safeParse({
      name: "Luis Herrera",
      username: "luis.herrera",
      email: "luis.herrera@example.com",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un rol inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      email: "ana.rojas@example.com",
      role: "inventado",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un correo inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Ana Rojas",
      username: "ana.rojas",
      email: "no-es-un-correo",
      role: "guard",
    });
    expect(result.success).toBe(false);
  });
});
