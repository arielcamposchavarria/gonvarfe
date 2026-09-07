import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getAccessToken: vi.fn().mockResolvedValue("test-token"),
}));

import { createHttpAccountRepository } from "./http-account-repository";
import { IncorrectCurrentPasswordError } from "@/domain/ports/account-repository";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpAccountRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("actualiza el perfil propio con PATCH /users/me, enviando el Bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({
        id: "user-1",
        username: "jperez",
        name: "Juan Pérez Nuevo",
        role: "admin",
        isActive: true,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpAccountRepository();
    const user = await repository.updateOwnProfile({ name: "Juan Pérez Nuevo", fotoPerfil: "data:image/png;base64,x" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ name: "Juan Pérez Nuevo", fotoPerfil: "data:image/png;base64,x" }),
    });
    expect(user.name).toBe("Juan Pérez Nuevo");
  });

  it("propaga el mensaje del backend si falla actualizar el perfil", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({ statusCode: 422, message: "El nombre del usuario no puede estar vacio", error: "InvalidUserNameException" }, 422),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpAccountRepository();
    await expect(repository.updateOwnProfile({ name: "" })).rejects.toThrow(/no puede estar vacio/i);
  });

  it("cambia la contraseña con PATCH /users/me/password", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse({ message: "Contraseña actualizada correctamente." }));
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpAccountRepository();
    await repository.changePassword({ currentPassword: "actual", newPassword: "nueva1234" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ currentPassword: "actual", newPassword: "nueva1234" }),
    });
  });

  it("lanza IncorrectCurrentPasswordError si el backend responde IncorrectCurrentPasswordException", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse(
        { statusCode: 401, message: "La contraseña actual no es correcta.", error: "IncorrectCurrentPasswordException" },
        401,
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpAccountRepository();
    await expect(repository.changePassword({ currentPassword: "mala", newPassword: "nueva1234" })).rejects.toBeInstanceOf(
      IncorrectCurrentPasswordError,
    );
  });

  it("no confunde un 401 por sesión inválida con contraseña actual incorrecta", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({ statusCode: 401, message: "Unauthorized" }, 401),
    );
    vi.stubGlobal("fetch", fetchMock);

    const repository = createHttpAccountRepository();
    let error: unknown;
    try {
      await repository.changePassword({ currentPassword: "x", newPassword: "nueva1234" });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeInstanceOf(IncorrectCurrentPasswordError);
  });
});
