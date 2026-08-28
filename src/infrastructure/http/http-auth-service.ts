import type { AuthResult, AuthService } from "@/domain/ports/auth-service";
import { buildAppUser, type BackendUser } from "./map-backend-user";

interface LoginResponseBody {
  accessToken: string;
  user: BackendUser;
}

/** Adaptador HTTP del puerto `AuthService` contra el backend real (gonvarbe). */
export function createHttpAuthService(): AuthService {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  return {
    async authenticate(username, password): Promise<AuthResult | null> {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("No se pudo iniciar sesión.");

      const body = (await res.json()) as LoginResponseBody;
      return { accessToken: body.accessToken, user: buildAppUser(body.user) };
    },
  };
}
