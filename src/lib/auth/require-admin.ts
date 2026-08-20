import { getSession } from "./session";
import { container } from "@/infrastructure/container";
import type { AdminUser } from "@/domain/entities/user";

/**
 * Los route handlers no quedan cubiertos de forma confiable por Proxy (ver
 * nota en src/app/guard/actions.ts sobre Server Functions), así que cada uno
 * valida sesión/rol por su cuenta en vez de depender solo del layout.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("No autorizado.");
  const user = await container.findUserById(session.userId);
  if (!user || user.role !== "admin" || !user.isActive) throw new Error("No autorizado.");
  return user;
}
