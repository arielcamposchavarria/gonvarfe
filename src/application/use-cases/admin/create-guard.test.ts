import { describe, expect, it } from "vitest";

import { createGuard, UsernameTakenError } from "./create-guard";
import { createMockUserRepository } from "@/infrastructure/mock/repositories/mock-user-repository";
import { createMockAuthService } from "@/infrastructure/mock/services/mock-auth-service";

function deps() {
  const userRepository = createMockUserRepository();
  const authService = createMockAuthService(userRepository);
  return { userRepository, authService };
}

describe("createGuard", () => {
  it("crea un nuevo oficial activo con la foto sin asignar", async () => {
    const { userRepository, authService } = deps();

    const guard = await createGuard(
      { userRepository, authService },
      { name: "Nuevo Oficial", username: "nuevo-oficial", password: "clave123", assignedSiteId: "site-1" },
    );

    expect(guard.id).toBeTruthy();
    expect(guard.role).toBe("guard");
    expect(guard.isActive).toBe(true);
    expect(guard.photoUrl).toBeNull();
    await expect(userRepository.findByUsername("nuevo-oficial")).resolves.toEqual(guard);
  });

  it("permite iniciar sesión con la contraseña registrada", async () => {
    const { userRepository, authService } = deps();

    await createGuard(
      { userRepository, authService },
      { name: "Nuevo Oficial", username: "nuevo-oficial-2", password: "clave123", assignedSiteId: "site-1" },
    );

    await expect(authService.authenticate("nuevo-oficial-2", "clave123")).resolves.toMatchObject({
      username: "nuevo-oficial-2",
    });
    await expect(authService.authenticate("nuevo-oficial-2", "incorrecta")).resolves.toBeNull();
  });

  it("rechaza crear un oficial con un username que ya existe", async () => {
    const { userRepository, authService } = deps();

    await createGuard(
      { userRepository, authService },
      { name: "Oficial Uno", username: "duplicado", password: "clave123", assignedSiteId: "site-1" },
    );

    await expect(
      createGuard(
        { userRepository, authService },
        { name: "Oficial Dos", username: "duplicado", password: "otraclave", assignedSiteId: "site-2" },
      ),
    ).rejects.toBeInstanceOf(UsernameTakenError);
  });
});
