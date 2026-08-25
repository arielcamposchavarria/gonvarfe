import { UsernameTakenError, type CreateUserInput, type UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";
import { getAccessToken } from "@/lib/auth/session";
import { buildAppUser, type BackendUser } from "./map-backend-user";

interface BackendRole {
  id: string;
  name: string;
}

/** Adaptador HTTP del puerto `UserRepository` contra el backend real (gonvarbe). */
export function createHttpUserRepository(): UserRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async findAll() {
      const res = await fetch(`${baseUrl}/users`, { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los usuarios.");
      const users = (await res.json()) as BackendUser[];
      return users.map(buildAppUser);
    },

    async findById(id) {
      const res = await fetch(`${baseUrl}/users/${id}`, { headers: await authHeaders(), cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo obtener el usuario.");
      return buildAppUser((await res.json()) as BackendUser);
    },

    async findByRole(role) {
      const res = await fetch(`${baseUrl}/users?role=${encodeURIComponent(role)}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los usuarios.");
      const users = (await res.json()) as BackendUser[];
      return users.map(buildAppUser);
    },

    async create(input: CreateUserInput): Promise<AppUser> {
      const rolesRes = await fetch(`${baseUrl}/roles`, { headers: await authHeaders(), cache: "no-store" });
      if (!rolesRes.ok) throw new Error("No se pudieron obtener los roles.");
      const roles = (await rolesRes.json()) as BackendRole[];
      const role = roles.find((r) => r.name === input.role);
      if (!role) throw new Error(`No existe el rol "${input.role}" en el backend.`);

      const res = await fetch(`${baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: input.username,
          name: input.name,
          password: input.password,
          roleId: role.id,
          assignedSiteId: input.assignedSiteId,
        }),
      });
      if (res.status === 409) throw new UsernameTakenError(input.username);
      if (!res.ok) throw new Error("No se pudo crear el usuario.");
      return buildAppUser((await res.json()) as BackendUser);
    },
  };
}
