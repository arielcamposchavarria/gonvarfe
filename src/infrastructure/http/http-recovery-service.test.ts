import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpRecoveryService } from "./http-recovery-service";
import { InvalidRecoveryCodeError } from "@/domain/ports/recovery-service";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpRecoveryService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("solicita un código al backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse({ message: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    const service = createHttpRecoveryService();
    await service.requestCode("jperez@example.com", "password");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/auth/recovery/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jperez@example.com", type: "password" }),
      cache: "no-store",
    });
  });

  it("retorna el username al verificar un código de tipo username", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockFetchResponse({ type: "username", username: "jperez" }));
    vi.stubGlobal("fetch", fetchMock);

    const service = createHttpRecoveryService();
    const result = await service.verifyCode("jperez@example.com", "1234", "username");

    expect(result).toEqual({ type: "username", username: "jperez" });
  });

  it("lanza InvalidRecoveryCodeError si el backend responde 401 al verificar", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 401));
    vi.stubGlobal("fetch", fetchMock);

    const service = createHttpRecoveryService();
    await expect(
      service.verifyCode("jperez@example.com", "0000", "password"),
    ).rejects.toBeInstanceOf(InvalidRecoveryCodeError);
  });

  it("lanza InvalidRecoveryCodeError si el backend responde 401 al restablecer la contraseña", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 401));
    vi.stubGlobal("fetch", fetchMock);

    const service = createHttpRecoveryService();
    await expect(
      service.resetPassword("jperez@example.com", "0000", "nueva-clave"),
    ).rejects.toBeInstanceOf(InvalidRecoveryCodeError);
  });

  it("restablece la contraseña correctamente", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse({ message: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    const service = createHttpRecoveryService();
    await service.resetPassword("jperez@example.com", "1234", "nueva-clave");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/auth/recovery/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jperez@example.com", code: "1234", newPassword: "nueva-clave" }),
      cache: "no-store",
    });
  });
});
