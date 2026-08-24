import type { AuthService } from "@/domain/ports/auth-service";
import type { AppUser } from "@/domain/entities/user";

export interface AuthenticateUserDeps {
  authService: AuthService;
}

export interface AuthenticateUserInput {
  username: string;
  password: string;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Usuario o contraseña inválidos.");
    this.name = "InvalidCredentialsError";
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super("Este usuario está desactivado. Contacte a un administrador.");
    this.name = "InactiveUserError";
  }
}

export async function authenticateUser(
  { authService }: AuthenticateUserDeps,
  { username, password }: AuthenticateUserInput,
): Promise<AppUser> {
  const user = await authService.authenticate(username, password);
  if (!user) throw new InvalidCredentialsError();
  if (!user.isActive) throw new InactiveUserError();
  return user;
}
