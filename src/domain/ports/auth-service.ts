import type { AppUser } from "../entities/user";

export interface AuthService {
  /** Retorna null si las credenciales son inválidas o el usuario está inactivo. */
  authenticate(username: string, password: string): Promise<AppUser | null>;
}
