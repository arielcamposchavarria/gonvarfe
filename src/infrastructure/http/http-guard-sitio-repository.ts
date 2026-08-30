import type { GuardSitioRepository } from "@/domain/ports/guard-sitio-repository";
import type { GuardSitio } from "@/domain/entities/guard-sitio";
import { getAccessToken } from "@/lib/auth/session";

/** Adaptador HTTP del puerto `GuardSitioRepository` contra el backend real (gonvarbe). */
export function createHttpGuardSitioRepository(): GuardSitioRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async findAll() {
      const res = await fetch(`${baseUrl}/sitios/guard`, { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los sitios.");
      return (await res.json()) as GuardSitio[];
    },
  };
}
