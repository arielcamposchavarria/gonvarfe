import type { UserRepository } from "@/domain/ports/user-repository";
import { users } from "../data/users";

export function createMockUserRepository(): UserRepository {
  return {
    async findAll() {
      return users;
    },
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async findByUsername(username) {
      const normalized = username.trim();
      return users.find((user) => user.username === normalized) ?? null;
    },
    async findByRole(role) {
      return users.filter((user) => user.role === role);
    },
  };
}
