import type { RoleOption, RoleRepository } from "@/domain/ports/role-repository";
import { getAccessToken } from "@/lib/auth/session";

/** Adaptador HTTP del puerto `RoleRepository` contra el backend real (gonvarbe). */
export function createHttpRoleRepository(): RoleRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  return {
    async findAll(): Promise<RoleOption[]> {
      const token = await getAccessToken();
      const res = await fetch(`${baseUrl}/roles`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los roles.");
      return (await res.json()) as RoleOption[];
    },
  };
}
