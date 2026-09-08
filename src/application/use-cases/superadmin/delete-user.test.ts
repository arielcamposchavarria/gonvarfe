import { describe, expect, it } from "vitest";

import { deleteUser } from "./delete-user";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

function createFakeUserRepository(existing: AppUser) {
  const deletedIds: string[] = [];
  const userRepository: UserRepository = {
    async findAll() {
      return [existing];
    },
    async findById() {
      return existing;
    },
    async findByRole() {
      return [existing];
    },
    async create() {
      throw new Error("No usado en esta prueba.");
    },
    async assignSite() {
      throw new Error("No usado en esta prueba.");
    },
    async deactivate() {
      throw new Error("No usado en esta prueba.");
    },
    async delete(userId: string) {
      deletedIds.push(userId);
    },
  };
  return { userRepository, deletedIds };
}

describe("deleteUser", () => {
  it("delega en el repositorio la eliminación del usuario", async () => {
    const existing: AppUser = {
      id: "user-1",
      name: "Juan Pérez",
      username: "jperez",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    const { userRepository, deletedIds } = createFakeUserRepository(existing);

    await deleteUser({ userRepository }, "user-1");

    expect(deletedIds).toEqual(["user-1"]);
  });
});
