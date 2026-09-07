import { describe, expect, it } from "vitest";

import { changePasswordSchema } from "./change-password-schema";

describe("changePasswordSchema", () => {
  it("acepta datos válidos con las contraseñas coincidiendo", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "actual",
      newPassword: "nueva1234",
      confirmNewPassword: "nueva1234",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza si falta la contraseña actual", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "nueva1234",
      confirmNewPassword: "nueva1234",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña nueva muy corta", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "actual",
      newPassword: "abc",
      confirmNewPassword: "abc",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza si la confirmación no coincide", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "actual",
      newPassword: "nueva1234",
      confirmNewPassword: "otra1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmNewPassword"]);
    }
  });
});
