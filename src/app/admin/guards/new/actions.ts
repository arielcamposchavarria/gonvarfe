"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createGuardSchema } from "@/lib/validation/create-guard-schema";
import { UsernameTakenError } from "@/domain/ports/user-repository";

export interface CreateGuardActionState {
  error: string | null;
}

export async function createGuardAction(
  _prevState: CreateGuardActionState,
  formData: FormData,
): Promise<CreateGuardActionState> {
  await requireAdmin();

  const parsed = createGuardSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let guardId: string;
  try {
    const guard = await container.createUser({ ...parsed.data, role: "guard" });
    guardId = guard.id;
  } catch (error) {
    if (error instanceof UsernameTakenError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/admin/guards/${guardId}`);
}
