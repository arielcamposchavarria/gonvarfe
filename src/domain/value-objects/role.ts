export const ROLES = ["superAdmin", "admin", "guard"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export const ROLE_LABELS: Record<Role, string> = {
  superAdmin: "Super administrador",
  admin: "Administrador",
  guard: "Oficial de seguridad",
};

export const ROLE_PATH_SEGMENT: Record<Role, string> = {
  superAdmin: "superadmin",
  admin: "admin",
  guard: "guard",
};
