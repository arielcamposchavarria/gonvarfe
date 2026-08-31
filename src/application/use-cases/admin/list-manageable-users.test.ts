import { describe, expect, it, vi } from "vitest";

import { listManageableUsers } from "./list-manageable-users";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { AdminUser, GuardUser } from "@/domain/entities/user";

function buildAdmin(id: string): AdminUser {
  return { id, name: `Admin ${id}`, username: `admin-${id}`, role: "admin", isActive: true, createdAt: new Date() };
}

function buildGuard(id: string): GuardUser {
  return {
    id,
    name: `Guardia ${id}`,
    username: `guardia-${id}`,
    role: "guard",
    isActive: true,
    createdAt: new Date(),
    photoUrl: null,
    assignedSiteId: null,
  };
}

describe("listManageableUsers", () => {
  it("combina administradores y guardas, sin incluir superAdmin", async () => {
    const admins = [buildAdmin("1")];
    const guards = [buildGuard("2")];
    const userRepository: UserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRole: vi.fn(async (role) => (role === "admin" ? admins : role === "guard" ? guards : [])),
      create: vi.fn(),
      assignSite: vi.fn(),
    };

    const result = await listManageableUsers({ userRepository });

    expect(result).toEqual([...admins, ...guards]);
    expect(userRepository.findByRole).toHaveBeenCalledWith("admin");
    expect(userRepository.findByRole).toHaveBeenCalledWith("guard");
  });
});
