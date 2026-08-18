import type { AppUser } from "../entities/user";
import type { Role } from "../value-objects/role";

export interface UserRepository {
  findAll(): Promise<AppUser[]>;
  findById(id: string): Promise<AppUser | null>;
  findByUsername(username: string): Promise<AppUser | null>;
  findByRole(role: Role): Promise<AppUser[]>;
}
