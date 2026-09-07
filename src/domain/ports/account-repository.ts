import type { AppUser } from "../entities/user";

export interface UpdateOwnProfileInput {
  name: string;
  fotoPerfil?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class IncorrectCurrentPasswordError extends Error {
  constructor() {
    super("La contraseña actual no es correcta.");
    this.name = "IncorrectCurrentPasswordError";
  }
}

/**
 * Autoservicio del propio usuario sobre sus datos (distinto de
 * `UserRepository`, que es la gestión de admin/superAdmin sobre otros
 * usuarios) — separado a propósito para no obligar a los fakes de
 * `UserRepository` ya existentes en tests a implementar estos métodos.
 */
export interface AccountRepository {
  /** PATCH /users/me — el backend siempre identifica al usuario por su JWT, nunca por un id explícito. */
  updateOwnProfile(input: UpdateOwnProfileInput): Promise<AppUser>;
  /** PATCH /users/me/password */
  changePassword(input: ChangePasswordInput): Promise<void>;
}
