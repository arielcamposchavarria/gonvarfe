import { describe, expect, it } from "vitest";

import { deactivateUser } from "./deactivate-user";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

function createFakeUserRepository(deactivated: AppUser): UserRepository {
  return {
    async findAll() {
      return [deactivated];
    },
    async findById() {
      return deactivated;
    },
    async findByRole() {
      return [deactivated];
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
    async assignSite() {
      throw new Error("No usado en esta prueba.");
    },
    async deactivate(userId: string) {
      if (userId !== deactivated.id) throw new Error("Usuario inesperado.");
      return deactivated;
    },
  };
}

describe("deactivateUser", () => {
  it("delega en el repositorio y retorna el usuario desactivado", async () => {
    const deactivated: AppUser = {
      id: "user-1",
      name: "Juan Pérez",
      username: "jperez",
      role: "admin",
      isActive: false,
      createdAt: new Date(),
    };
    const userRepository = createFakeUserRepository(deactivated);

    const result = await deactivateUser({ userRepository }, "user-1");

    expect(result.isActive).toBe(false);
  });
});
