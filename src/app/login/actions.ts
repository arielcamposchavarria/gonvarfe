"use server";

import { redirect } from "next/navigation";
import { container } from "@/infrastructure/container";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/login-schema";
import { ROLE_PATH_SEGMENT } from "@/domain/value-objects/role";
import { InvalidCredentialsError } from "@/application/use-cases/auth/authenticate-user";

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let user;
  try {
    user = await container.authenticateUser(parsed.data);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) return { error: error.message };
    throw error;
  }

  await createSession(user);
  redirect(`/${ROLE_PATH_SEGMENT[user.role]}/dashboard`);
}
