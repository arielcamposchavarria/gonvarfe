import { describe, expect, it, vi } from "vitest";

import { assignGuardSite } from "./assign-guard-site";
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

describe("assignGuardSite", () => {
  it("reenvía guardId y siteId al repositorio", async () => {
    const assignSite = vi.fn().mockResolvedValue(buildGuard({ assignedSiteId: "sitio-1" }));
    const userRepository: UserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRole: vi.fn(),
      create: vi.fn(),
      assignSite,
    };

    const result = await assignGuardSite({ userRepository }, { guardId: "guard-1", siteId: "sitio-1" });

    expect(assignSite).toHaveBeenCalledWith("guard-1", "sitio-1");
    expect(result).toMatchObject({ assignedSiteId: "sitio-1" });
  });

  it("permite desasignar pasando siteId null", async () => {
    const assignSite = vi.fn().mockResolvedValue(buildGuard({ assignedSiteId: null }));
    const userRepository: UserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRole: vi.fn(),
      create: vi.fn(),
      assignSite,
    };

    await assignGuardSite({ userRepository }, { guardId: "guard-1", siteId: null });

    expect(assignSite).toHaveBeenCalledWith("guard-1", null);
  });

  it("propaga el error del repositorio (p. ej. usuario no es guard)", async () => {
    const userRepository: UserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByRole: vi.fn(),
      create: vi.fn(),
      assignSite: vi.fn().mockRejectedValue(new Error('Solo un usuario con rol "guard" puede tener un sitio asignado')),
    };

    await expect(assignGuardSite({ userRepository }, { guardId: "admin-1", siteId: "sitio-1" })).rejects.toThrow(
      /rol "guard"/,
    );
  });
});
