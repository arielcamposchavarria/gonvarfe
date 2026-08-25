import { describe, expect, it } from "vitest";

import { authenticateUser, InvalidCredentialsError, InactiveUserError } from "./authenticate-user";
import type { AuthResult, AuthService } from "@/domain/ports/auth-service";
import type { GuardUser } from "@/domain/entities/user";

function createFakeAuthService(resultsByCredentials: Record<string, AuthResult>): AuthService {
  return {
    async authenticate(username, password) {
      const key = `${username}:${password}`;
      return resultsByCredentials[key] ?? null;
    },
  };
}

const ACTIVE_GUARD: GuardUser = {
  id: "guard-1",
  name: "Mario Solano",
  username: "guard",
  role: "guard",
  assignedSiteId: "site-1",
  isActive: true,
  createdAt: new Date("2025-01-01"),
};

const INACTIVE_GUARD: GuardUser = { ...ACTIVE_GUARD, id: "guard-2", username: "guardInactivo", isActive: false };

describe("authenticateUser", () => {
  it("devuelve el usuario y el token cuando las credenciales son válidas y está activo", async () => {
    const authService = createFakeAuthService({
      "guard:1234": { user: ACTIVE_GUARD, accessToken: "signed.jwt.token" },
    });

    await expect(authenticateUser({ authService }, { username: "guard", password: "1234" })).resolves.toEqual({
      user: ACTIVE_GUARD,
      accessToken: "signed.jwt.token",
    });
  });

  it("lanza InvalidCredentialsError si el usuario o la contraseña no coinciden", async () => {
    const authService = createFakeAuthService({});

    await expect(
      authenticateUser({ authService }, { username: "guard", password: "incorrecta" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("lanza InactiveUserError (no InvalidCredentialsError) si las credenciales son correctas pero el usuario está inactivo", async () => {
    const authService = createFakeAuthService({
      "guardInactivo:1234": { user: INACTIVE_GUARD, accessToken: "signed.jwt.token" },
    });

    await expect(
      authenticateUser({ authService }, { username: "guardInactivo", password: "1234" }),
    ).rejects.toBeInstanceOf(InactiveUserError);
  });
});
