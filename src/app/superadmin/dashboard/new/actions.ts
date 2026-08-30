"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createUserSchema } from "@/lib/validation/create-user-schema";
import { UsernameTakenError } from "@/domain/ports/user-repository";

export interface CreateUserActionState {
  error: string | null;
}

export async function createUserAction(
  _prevState: CreateUserActionState,
  formData: FormData,
): Promise<CreateUserActionState> {
  await requireSuperAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await container.createUser(parsed.data);
  } catch (error) {
    if (error instanceof UsernameTakenError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/superadmin/dashboard");
}
