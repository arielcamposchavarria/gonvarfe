"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createSiteSchema } from "@/lib/validation/create-site-schema";
import { SiteNotFoundError } from "@/application/use-cases/superadmin/add-site-visiting-local";

export interface CreateSiteActionState {
  error: string | null;
}

export async function createSiteAction(
  _prevState: CreateSiteActionState,
  formData: FormData,
): Promise<CreateSiteActionState> {
  await requireSuperAdmin();

  const parsed = createSiteSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    visitingLocals: formData.get("visitingLocals") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await container.createSite(parsed.data);

  redirect("/superadmin/sites");
}

export interface AddVisitingLocalActionState {
  error: string | null;
}

export async function addVisitingLocalAction(
  _prevState: AddVisitingLocalActionState,
  formData: FormData,
): Promise<AddVisitingLocalActionState> {
  await requireSuperAdmin();

  const siteId = formData.get("siteId");
  const local = formData.get("local");

  if (typeof siteId !== "string" || !siteId) {
    return { error: "Sitio inválido." };
  }
  if (typeof local !== "string" || local.trim().length === 0) {
    return { error: "Ingrese el nombre de la marca." };
  }

  try {
    await container.addSiteVisitingLocal({ siteId, local: local.trim() });
  } catch (error) {
    if (error instanceof SiteNotFoundError) return { error: error.message };
    throw error;
  }

  redirect("/superadmin/sites");
}
