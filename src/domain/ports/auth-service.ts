import type { AppUser } from "../entities/user";

export interface AuthResult {
  user: AppUser;
  accessToken: string;
}

export interface AuthService {
  /**
   * Retorna null si el usuario/contraseña no coinciden. No valida si el
   * usuario está activo: esa regla de negocio la aplica authenticateUser.
   */
  authenticate(username: string, password: string): Promise<AuthResult | null>;
}
