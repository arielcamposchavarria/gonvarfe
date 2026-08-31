import type { AppUser } from "@/domain/entities/user";
import { isRole } from "@/domain/value-objects/role";

/** Forma cruda que expone gonvarbe (login, GET /users, GET /users/:id). */
export interface BackendUser {
  id: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  sitioAsignadoId?: string | null;
}

/**
 * gonvarbe no registra fecha de alta de usuarios todavía; se usa la fecha
 * actual como valor de despliegue, ya que ningún flujo de negocio depende de
 * su valor real (ver AppUser.createdAt).
 */
export function buildAppUser(backendUser: BackendUser): AppUser {
  if (!isRole(backendUser.role)) {
    throw new Error(`Rol desconocido recibido del backend: "${backendUser.role}".`);
  }

  const base = {
    id: backendUser.id,
    username: backendUser.username,
    name: backendUser.name,
    isActive: backendUser.isActive,
    createdAt: new Date(),
  };

  if (backendUser.role === "guard") {
    return {
      ...base,
      role: "guard",
      photoUrl: null,
      assignedSiteId: backendUser.sitioAsignadoId ?? null,
    };
  }

  return { ...base, role: backendUser.role };
}
