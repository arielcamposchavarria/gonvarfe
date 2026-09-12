"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export interface DeleteUserActionState {
  error: string | null;
}

export async function deleteUserAction(userId: string): Promise<DeleteUserActionState> {
  await requireSuperAdmin();

  try {
    await container.deleteUser(userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath("/superadmin/dashboard");
  return { error: null };
}
