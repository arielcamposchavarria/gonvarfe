import type { AppUser } from "../entities/user";
import type { Role } from "../value-objects/role";

export interface CreateUserInput {
  name: string;
  username: string;
  password: string;
  role: Role;
  /** Solo aplica cuando `role` es `"guard"`. */
  assignedSiteId?: string;
}

export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`El usuario "${username}" ya existe.`);
    this.name = "UsernameTakenError";
  }
}

export interface UserRepository {
  findAll(): Promise<AppUser[]>;
  findById(id: string): Promise<AppUser | null>;
  findByRole(role: Role): Promise<AppUser[]>;
  create(input: CreateUserInput): Promise<AppUser>;
}
