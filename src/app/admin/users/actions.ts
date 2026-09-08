"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface DeactivateUserActionState {
  error: string | null;
}

export async function deactivateUserAction(userId: string): Promise<DeactivateUserActionState> {
  await requireAdmin();

  try {
    await container.deactivateUser(userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath("/admin/users");
  return { error: null };
}
