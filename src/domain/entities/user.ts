import type { Role } from "../value-objects/role";

interface BaseUser {
  readonly id: string;
  name: string;
  username: string;
  isActive: boolean;
  readonly createdAt: Date;
}

export interface SuperAdminUser extends BaseUser {
  role: "superAdmin";
}

export interface AdminUser extends BaseUser {
  role: "admin";
}

export interface GuardUser extends BaseUser {
  role: "guard";
  /** Foto de referencia asignada por el admin; el guard no puede modificarla. */
  photoUrl?: string | null;
}

export type AppUser = SuperAdminUser | AdminUser | GuardUser;

export function isGuard(user: AppUser): user is GuardUser {
  return user.role === "guard";
}

export function hasRole<R extends Role>(user: AppUser, role: R): user is Extract<AppUser, { role: R }> {
  return user.role === role;
}
