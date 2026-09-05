import type { AppUser } from "../entities/user";
import type { Role } from "../value-objects/role";

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  role: Role;
}

export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`El usuario "${username}" ya existe.`);
    this.name = "UsernameTakenError";
  }
}

export class EmailTakenError extends Error {
  constructor(email: string) {
    super(`Ya existe un usuario registrado con el correo "${email}".`);
    this.name = "EmailTakenError";
  }
}

export interface UserRepository {
  findAll(): Promise<AppUser[]>;
  findById(id: string): Promise<AppUser | null>;
  findByRole(role: Role): Promise<AppUser[]>;
  create(input: CreateUserInput): Promise<AppUser>;
  /** Solo aplica a guards; null desasigna el sitio vigente. */
  assignSite(guardId: string, siteId: string | null): Promise<AppUser>;
}
