import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpUserRepository } from "./http-user-repository";
import { UsernameTakenError } from "@/domain/ports/user-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpUserRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envía el Bearer token al listar usuarios", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    await repository.findAll();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/users", {
      headers: { Authorization: "Bearer test-token" },
      cache: "no-store",
    });
  });

  it("retorna null si el usuario no existe", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 404));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    await expect(repository.findById("no-existe")).resolves.toBeNull();
  });

  it("resuelve el roleId a partir del nombre de rol antes de crear el usuario, y envía el Bearer token", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/roles")) {
        return Promise.resolve(mockFetchResponse([{ id: "role-guard", name: "guard" }]));
      }
      return Promise.resolve(
        mockFetchResponse({
          id: "user-1",
          username: "msolano",
          name: "Mario Solano",
          role: "guard",
          isActive: true,
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    const user = await repository.create({
      name: "Mario Solano",
      username: "msolano",
      password: "clave123",
      role: "guard",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3002/users",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
        body: JSON.stringify({
          username: "msolano",
          name: "Mario Solano",
          password: "clave123",
          roleId: "role-guard",
        }),
      }),
    );
    expect(user.role).toBe("guard");
  });

  it("lanza UsernameTakenError si el backend responde 409", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/roles")) {
        return Promise.resolve(mockFetchResponse([{ id: "role-admin", name: "admin" }]));
      }
      return Promise.resolve(mockFetchResponse(null, 409));
    });
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    await expect(
      repository.create({ name: "Dup", username: "dup", password: "clave123", role: "admin" }),
    ).rejects.toBeInstanceOf(UsernameTakenError);
  });
});
