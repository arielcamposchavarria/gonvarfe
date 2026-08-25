import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpAuthService } from "./http-auth-service";

function mockFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("createHttpAuthService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna el usuario y el token cuando las credenciales son válidas", async () => {
    const body = {
      accessToken: "signed.jwt.token",
      user: {
        id: "user-1",
        username: "gvargas",
        name: "Gabriela Vargas",
        role: "superAdmin",
        isActive: true,
        assignedSiteId: null,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(body));
    vi.stubGlobal("fetch", fetchMock);

    const authService = createHttpAuthService();
    const result = await authService.authenticate("gvargas", "1234");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3002/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "gvargas", password: "1234" }),
      cache: "no-store",
    });
    expect(result?.accessToken).toBe("signed.jwt.token");
    expect(result?.user).toMatchObject({ id: "user-1", username: "gvargas", role: "superAdmin" });
  });

  it("retorna null si las credenciales son inválidas (401)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(null, 401));
    vi.stubGlobal("fetch", fetchMock);

    const authService = createHttpAuthService();
    await expect(authService.authenticate("nadie", "mal")).resolves.toBeNull();
  });

  it("arma un GuardUser con assignedSiteId cuando el rol es guard", async () => {
    const body = {
      accessToken: "signed.jwt.token",
      user: {
        id: "user-2",
        username: "msolano",
        name: "Mario Solano",
        role: "guard",
        isActive: true,
        assignedSiteId: "site-1",
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(body));
    vi.stubGlobal("fetch", fetchMock);

    const authService = createHttpAuthService();
    const result = await authService.authenticate("msolano", "1234");

    expect(result?.user).toMatchObject({ role: "guard", assignedSiteId: "site-1" });
  });
});
