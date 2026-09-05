"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface AssignGuardSiteActionState {
  error: string | null;
}

export async function assignGuardSiteAction(
  guardId: string,
  siteId: string | null,
): Promise<AssignGuardSiteActionState> {
  await requireAdmin();

  if (!guardId) {
    return { error: "Guardia inválido." };
  }

  try {
    await container.assignGuardSite({ guardId, siteId });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath("/admin/guards");
  return { error: null };
}
