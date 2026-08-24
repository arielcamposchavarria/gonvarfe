import type { AppUser } from "../entities/user";

export interface AuthService {
  /**
   * Retorna null si el usuario/contraseña no coinciden. No valida si el
   * usuario está activo: esa regla de negocio la aplica authenticateUser.
   */
  authenticate(username: string, password: string): Promise<AppUser | null>;
  /** Asocia una contraseña al usuario para que pueda iniciar sesión. */
  registerCredentials(userId: string, password: string): Promise<void>;
}
