import { describe, expect, it, vi } from "vitest";

import { listGuards } from "./list-guards";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";

function buildGuard(overrides: Partial<GuardUser> = {}): GuardUser {
  return {
    id: "guard-1",
    name: "Mario Solano",
    username: "msolano",
    role: "guard",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    photoUrl: null,
    assignedSiteId: null,
    ...overrides,
  };
}

describe("listGuards", () => {
  it("excluye a los guardas desactivados", async () => {
    const active = buildGuard({ id: "guard-1", isActive: true });
    const inactive = buildGuard({ id: "guard-2", isActive: false });
    const userRepository: UserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRole: vi.fn().mockResolvedValue([active, inactive]),
      create: vi.fn(),
      assignSite: vi.fn(),
      deactivate: vi.fn(),
      delete: vi.fn(),
    };

    const result = await listGuards({ userRepository });

    expect(result).toEqual([active]);
  });
});
