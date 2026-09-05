"use server";

import { container } from "@/infrastructure/container";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/login-schema";
import { ROLE_PATH_SEGMENT } from "@/domain/value-objects/role";
import { InvalidCredentialsError, InactiveUserError } from "@/application/use-cases/auth/authenticate-user";

export interface LoginActionState {
  error: string | null;
  redirectTo: string | null;
}

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos.", redirectTo: null };
  }

  let result;
  try {
    result = await container.authenticateUser(parsed.data);
  } catch (error) {
    if (error instanceof InvalidCredentialsError || error instanceof InactiveUserError) {
      return { error: error.message, redirectTo: null };
    }
    throw error;
  }

  await createSession(result.accessToken);

  // Un guardia sin sitio asignado nunca llega al dashboard: se le informa
  // apenas termina de loguear en vez de dejarlo entrar y rebotarlo después.
  const redirectTo =
    result.user.role === "guard" && !result.user.assignedSiteId
      ? "/guard/select-site"
      : `/${ROLE_PATH_SEGMENT[result.user.role]}/dashboard`;

  return { error: null, redirectTo };
}
