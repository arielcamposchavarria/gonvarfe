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
    super("Usuario o contraseña inválidos, o el usuario está desactivado.");
    this.name = "InvalidCredentialsError";
  }
}

export async function authenticateUser(
  { authService }: AuthenticateUserDeps,
  { username, password }: AuthenticateUserInput,
): Promise<AppUser> {
  const user = await authService.authenticate(username, password);
  if (!user) throw new InvalidCredentialsError();
  return user;
}
