import {
  UsernameTakenError,
  EmailTakenError,
  type CreateUserInput,
  type UserRepository,
} from "@/domain/ports/user-repository";
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
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          username: input.username,
          name: input.name,
          email: input.email,
          roleId: role.id,
        }),
      });
      if (res.status === 409) {
        // El backend distingue username y email duplicados con excepciones
        // de dominio distintas (ambas responden 409) — antes esto asumía
        // siempre "username duplicado" sin mirar el body, así que un correo
        // repetido se le reportaba al admin como si el USERNAME ya existiera,
        // un mensaje totalmente equivocado.
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "EmailAlreadyExistsException") throw new EmailTakenError(input.email);
        throw new UsernameTakenError(input.username);
      }
      if (!res.ok) throw new Error("No se pudo crear el usuario.");
      return buildAppUser((await res.json()) as BackendUser);
    },

    async assignSite(guardId, siteId) {
      const res = await fetch(`${baseUrl}/users/${guardId}/sitio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ sitioId: siteId }),
      });
      if (!res.ok) {
        // A diferencia de /recorridos (pocas excepciones conocidas, mapeadas
        // 1 a 1), aquí hay varias posibles (sitio/guardia inexistente, turno
        // no finalizable por recorrido en progreso, etc.) y el backend ya
        // devuelve `message` en español listo para mostrar — se usa tal
        // cual en vez de duplicar cada caso en un mapeo propio.
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "No se pudo asignar el sitio.");
      }
      return buildAppUser((await res.json()) as BackendUser);
    },
  };
}
