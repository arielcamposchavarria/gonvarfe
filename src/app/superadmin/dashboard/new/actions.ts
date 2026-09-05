"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createUserSchema } from "@/lib/validation/create-user-schema";
import { UsernameTakenError, EmailTakenError } from "@/domain/ports/user-repository";

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
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await container.createUser(parsed.data);
  } catch (error) {
    if (error instanceof UsernameTakenError || error instanceof EmailTakenError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/superadmin/dashboard");
  return { error: null };
}
