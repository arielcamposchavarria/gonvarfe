import type { AppUser } from "@/domain/entities/user";

/**
 * Usuario de demostración por rol: el nombre de usuario es el rol mismo para
 * facilitar el login mientras no hay funcionalidad real (ver credentials.ts).
 */
export const users: AppUser[] = [
  {
    id: "user-super-1",
    name: "Gabriela Vargas",
    username: "superAdmin",
    role: "superAdmin",
    isActive: true,
    createdAt: new Date("2025-01-10"),
  },
  {
    id: "user-admin-1",
    name: "Luis Herrera",
    username: "admin",
    role: "admin",
    isActive: true,
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "user-guard-1",
    name: "Mario Solano",
    username: "guard",
    role: "guard",
    assignedSiteId: "site-1",
    isActive: true,
    createdAt: new Date("2025-02-01"),
    // Sin foto asignada aún; el admin la carga al crear/editar el oficial.
    photoUrl: null,
  },
  {
    id: "user-guard-2",
    name: "Kevin Araya",
    username: "guardInactivo",
    role: "guard",
    assignedSiteId: "site-2",
    isActive: false,
    createdAt: new Date("2025-02-10"),
    photoUrl: null,
  },
];
