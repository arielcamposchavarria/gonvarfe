import { describe, expect, it } from "vitest";

import {
  recoveryCodeSchema,
  recoveryEmailSchema,
  recoveryNewPasswordSchema,
} from "./recover-account-schema";

describe("recoveryEmailSchema", () => {
  it("acepta un correo válido", () => {
    expect(recoveryEmailSchema.safeParse({ email: "jperez@example.com" }).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(recoveryEmailSchema.safeParse({ email: "no-es-un-correo" }).success).toBe(false);
  });
});

describe("recoveryCodeSchema", () => {
  it("acepta un código de 4 dígitos", () => {
    expect(recoveryCodeSchema.safeParse({ code: "1234" }).success).toBe(true);
  });

  it("rechaza un código que no tenga exactamente 4 dígitos", () => {
    expect(recoveryCodeSchema.safeParse({ code: "123" }).success).toBe(false);
    expect(recoveryCodeSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(recoveryCodeSchema.safeParse({ code: "abcd" }).success).toBe(false);
  });
});

describe("recoveryNewPasswordSchema", () => {
  it("acepta cuando la contraseña y su confirmación coinciden", () => {
    const result = recoveryNewPasswordSchema.safeParse({
      password: "clave123",
      confirmPassword: "clave123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    const result = recoveryNewPasswordSchema.safeParse({
      password: "clave123",
      confirmPassword: "otra-clave",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const result = recoveryNewPasswordSchema.safeParse({
      password: "123",
      confirmPassword: "123",
    });
    expect(result.success).toBe(false);
  });
});
