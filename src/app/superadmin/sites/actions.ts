"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { createSiteSchema } from "@/lib/validation/create-site-schema";
import { updateSiteSchema } from "@/lib/validation/update-site-schema";
import { updateMarcaSchema } from "@/lib/validation/update-marca-schema";
import { SitioNotFoundError } from "@/application/use-cases/superadmin/add-marca";

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
    visitingLocals: formData.getAll("visitingLocals"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await container.createSitio({
    nombre: parsed.data.name,
    direccion: parsed.data.address,
    marcas: parsed.data.visitingLocals,
  });

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
    await container.addMarca({ sitioId: siteId, nombre: local.trim() });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect("/superadmin/sites");
}

export interface GenerateMarcaQrActionState {
  qrCodeId: string | null;
  error: string | null;
}

export async function generateMarcaQrAction(sitioId: string, marcaId: string): Promise<GenerateMarcaQrActionState> {
  await requireSuperAdmin();

  try {
    const sitio = await container.generateMarcaQr({ sitioId, marcaId });
    const marca = sitio.marcas.find((m) => m.id === marcaId);
    return { qrCodeId: marca?.qrCodeId ?? null, error: null };
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { qrCodeId: null, error: error.message };
    throw error;
  }
}

export interface UpdateSiteActionState {
  error: string | null;
}

export async function updateSiteAction(
  _prevState: UpdateSiteActionState,
  formData: FormData,
): Promise<UpdateSiteActionState> {
  await requireSuperAdmin();

  const siteId = formData.get("siteId");
  if (typeof siteId !== "string" || !siteId) {
    return { error: "Sitio inválido." };
  }

  const parsed = updateSiteSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await container.updateSitio({ sitioId: siteId, nombre: parsed.data.name, direccion: parsed.data.address });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/superadmin/sites/${siteId}`);
}

export interface DeactivateSiteActionState {
  error: string | null;
}

export async function deactivateSiteAction(sitioId: string): Promise<DeactivateSiteActionState> {
  await requireSuperAdmin();

  try {
    await container.deactivateSitio(sitioId);
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/superadmin/sites/${sitioId}`);
}

export interface UpdateMarcaActionState {
  error: string | null;
}

export async function updateMarcaAction(
  _prevState: UpdateMarcaActionState,
  formData: FormData,
): Promise<UpdateMarcaActionState> {
  await requireSuperAdmin();

  const sitioId = formData.get("sitioId");
  const marcaId = formData.get("marcaId");
  if (typeof sitioId !== "string" || !sitioId || typeof marcaId !== "string" || !marcaId) {
    return { error: "Marca inválida." };
  }

  const parsed = updateMarcaSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await container.updateMarca({ sitioId, marcaId, nombre: parsed.data.name });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/superadmin/sites/${sitioId}`);
}

export async function deactivateMarcaAction(sitioId: string, marcaId: string): Promise<{ error: string | null }> {
  await requireSuperAdmin();

  try {
    await container.deactivateMarca({ sitioId, marcaId });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/superadmin/sites/${sitioId}`);
}
