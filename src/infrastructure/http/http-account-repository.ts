import {
  IncorrectCurrentPasswordError,
  type AccountRepository,
  type ChangePasswordInput,
  type UpdateOwnProfileInput,
} from "@/domain/ports/account-repository";
import { getAccessToken } from "@/lib/auth/session";
import { buildAppUser, type BackendUser } from "./map-backend-user";

/** Adaptador HTTP del puerto `AccountRepository` contra el backend real (gonvarbe). */
export function createHttpAccountRepository(): AccountRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async updateOwnProfile(input: UpdateOwnProfileInput) {
      const res = await fetch(`${baseUrl}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ name: input.name, fotoPerfil: input.fotoPerfil }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "No se pudo actualizar el perfil.");
      }
      return buildAppUser((await res.json()) as BackendUser);
    },

    async changePassword(input: ChangePasswordInput) {
      const res = await fetch(`${baseUrl}/users/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ currentPassword: input.currentPassword, newPassword: input.newPassword }),
      });
      if (!res.ok) {
        // 401 también lo devuelve JwtAuthGuard si la sesión es inválida (no
        // solo IncorrectCurrentPasswordException) — hay que mirar `error`
        // (nombre de la excepción de dominio), igual que en otros adaptadores,
        // en vez de asumir por el código de estado solo.
        const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        if (body?.error === "IncorrectCurrentPasswordException") throw new IncorrectCurrentPasswordError();
        throw new Error(body?.message ?? "No se pudo cambiar la contraseña.");
      }
    },
  };
}
