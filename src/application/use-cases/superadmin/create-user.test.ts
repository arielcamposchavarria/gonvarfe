import { describe, expect, it } from "vitest";

import { createUser, UsernameTakenError } from "./create-user";
import type { CreateUserInput, UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

function createFakeUserRepository(existing: AppUser[] = []): UserRepository {
  const users = [...existing];
  return {
    async findAll() {
      return users;
    },
    async findById(id) {
      return users.find((u) => u.id === id) ?? null;
    },
    async findByRole(role) {
      return users.filter((u) => u.role === role);
    },
    async create(input: CreateUserInput) {
      if (users.some((u) => u.username === input.username)) {
        throw new UsernameTakenError(input.username);
      }
      const created: AppUser =
        input.role === "guard"
          ? {
              id: crypto.randomUUID(),
              name: input.name,
              username: input.username,
              role: "guard",
              assignedSiteId: input.assignedSiteId ?? "",
              isActive: true,
              createdAt: new Date(),
              photoUrl: null,
            }
          : {
              id: crypto.randomUUID(),
              name: input.name,
              username: input.username,
              role: input.role,
              isActive: true,
              createdAt: new Date(),
            };
      users.push(created);
      return created;
    },
  };
}

describe("createUser", () => {
  it("crea un usuario delegando en el repositorio", async () => {
    const userRepository = createFakeUserRepository();

    const user = await createUser(
      { userRepository },
      { name: "Nueva Admin", username: "nueva-admin", password: "clave123", role: "admin" },
    );

    expect(user.username).toBe("nueva-admin");
    expect(user.role).toBe("admin");
  });

  it("crea un guard con el sitio asignado", async () => {
    const userRepository = createFakeUserRepository();

    const user = await createUser(
      { userRepository },
      { name: "Nuevo Oficial", username: "nuevo-oficial", password: "clave123", role: "guard", assignedSiteId: "site-1" },
    );

    expect(user.role).toBe("guard");
    if (user.role === "guard") {
      expect(user.assignedSiteId).toBe("site-1");
    }
  });

  it("propaga UsernameTakenError si el repositorio la lanza", async () => {
    const existing: AppUser = {
      id: "user-1",
      name: "Existente",
      username: "duplicado",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    const userRepository = createFakeUserRepository([existing]);

    await expect(
      createUser(
        { userRepository },
        { name: "Otro", username: "duplicado", password: "clave123", role: "admin" },
      ),
    ).rejects.toBeInstanceOf(UsernameTakenError);
  });
});
