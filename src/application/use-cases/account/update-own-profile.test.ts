import { describe, expect, it, vi } from "vitest";

import { updateOwnProfile } from "./update-own-profile";
import type { AccountRepository } from "@/domain/ports/account-repository";
import type { AppUser } from "@/domain/entities/user";

function buildUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    id: "user-1",
    name: "Juan Pérez",
    username: "jperez",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  } as AppUser;
}

describe("updateOwnProfile", () => {
  it("delega en el repositorio tal cual", async () => {
    const accountRepository: AccountRepository = {
      updateOwnProfile: vi.fn().mockResolvedValue(buildUser({ name: "Nuevo Nombre" })),
      changePassword: vi.fn(),
    };

    const user = await updateOwnProfile({ accountRepository }, { name: "Nuevo Nombre", fotoPerfil: "data:x" });

    expect(accountRepository.updateOwnProfile).toHaveBeenCalledWith({ name: "Nuevo Nombre", fotoPerfil: "data:x" });
    expect(user.name).toBe("Nuevo Nombre");
  });
});
