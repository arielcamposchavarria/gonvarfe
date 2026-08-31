"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export interface AssignGuardSiteActionState {
  error: string | null;
}

export async function assignGuardSiteAction(
  _prevState: AssignGuardSiteActionState,
  formData: FormData,
): Promise<AssignGuardSiteActionState> {
  await requireSuperAdmin();

  const guardId = formData.get("guardId");
  if (typeof guardId !== "string" || !guardId) {
    return { error: "Guardia inválido." };
  }

  const rawSiteId = formData.get("siteId");
  const siteId = typeof rawSiteId === "string" && rawSiteId !== "" ? rawSiteId : null;

  try {
    await container.assignGuardSite({ guardId, siteId });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath("/superadmin/guards");
  return { error: null };
}
