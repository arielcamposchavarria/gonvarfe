import type { Role } from "../value-objects/role";

interface BaseUser {
  readonly id: string;
  name: string;
  username: string;
  isActive: boolean;
  readonly createdAt: Date;
  /** Foto de perfil (base64 data URL); el propio usuario puede cambiarla desde "Mi perfil". */
  photoUrl?: string | null;
  readonly email?: string | null;
}

export interface SuperAdminUser extends BaseUser {
  role: "superAdmin";
}

export interface AdminUser extends BaseUser {
  role: "admin";
}

export interface GuardUser extends BaseUser {
  role: "guard";
  /** Sitio vigente asignado por el admin; null si no tiene ninguno. */
  assignedSiteId?: string | null;
}

export type AppUser = SuperAdminUser | AdminUser | GuardUser;

export function isGuard(user: AppUser): user is GuardUser {
  return user.role === "guard";
}

export function hasRole<R extends Role>(user: AppUser, role: R): user is Extract<AppUser, { role: R }> {
  return user.role === role;
}
