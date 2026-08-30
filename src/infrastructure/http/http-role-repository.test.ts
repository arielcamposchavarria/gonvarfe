import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpRoleRepository } from "./http-role-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpRoleRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna la lista de roles con el Bearer token", async () => {
    const roles = [
      { id: "role-1", name: "superAdmin" },
      { id: "role-2", name: "admin" },
      { id: "role-3", name: "guard" },
    ];
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(roles));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpRoleRepository();
    const result = await repository.findAll();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/roles", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
    expect(result).toEqual(roles);
  });
});
