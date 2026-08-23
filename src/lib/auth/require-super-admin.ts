import { getSession } from "./session";
import { container } from "@/infrastructure/container";
import type { SuperAdminUser } from "@/domain/entities/user";

/**
 * Los route handlers y Server Functions no quedan cubiertos de forma
 * confiable por Proxy (ver nota en src/app/guard/actions.ts), así que cada
 * uno valida sesión/rol por su cuenta en vez de depender solo del layout.
 */
export async function requireSuperAdmin(): Promise<SuperAdminUser> {
  const session = await getSession();
  if (!session || session.role !== "superAdmin") throw new Error("No autorizado.");
  const user = await container.findUserById(session.userId);
  if (!user || user.role !== "superAdmin" || !user.isActive) throw new Error("No autorizado.");
  return user;
}
