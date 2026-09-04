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
      email: "msolano@example.com",
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
          email: "msolano@example.com",
          roleId: "role-guard",
        }),
      }),
    );
    expect(user.role).toBe("guard");
  });

  it("mapea sitioAsignadoId a assignedSiteId al leer un guard", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({
        id: "guard-1",
        username: "msolano",
        name: "Mario Solano",
        role: "guard",
        isActive: true,
        sitioAsignadoId: "sitio-1",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    const user = await repository.findById("guard-1");

    expect(user).toMatchObject({ role: "guard", assignedSiteId: "sitio-1" });
  });

  it("asigna el sitio con PATCH /users/:id/sitio, enviando null para desasignar", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({
        id: "guard-1",
        username: "msolano",
        name: "Mario Solano",
        role: "guard",
        isActive: true,
        sitioAsignadoId: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    const user = await repository.assignSite("guard-1", null);

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/users/guard-1/sitio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ sitioId: null }),
    });
    expect(user).toMatchObject({ assignedSiteId: null });
  });

  it("al reasignar o desasignar, propaga el mensaje del backend en vez de uno genérico", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse(
        { statusCode: 409, message: "No se puede finalizar el turno mientras haya un recorrido en progreso", error: "RecorridoEnProgresoException" },
        409,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpUserRepository();
    await expect(repository.assignSite("guard-1", "sitio-2")).rejects.toThrow(
      /recorrido en progreso/i,
    );
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
      repository.create({ name: "Dup", username: "dup", email: "dup@example.com", role: "admin" }),
    ).rejects.toBeInstanceOf(UsernameTakenError);
  });
});
