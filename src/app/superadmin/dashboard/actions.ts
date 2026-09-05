"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export interface DeactivateUserActionState {
  error: string | null;
}

export async function deactivateUserAction(userId: string): Promise<DeactivateUserActionState> {
  await requireSuperAdmin();

  try {
    await container.deactivateUser(userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath("/superadmin/dashboard");
  return { error: null };
}
