"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSiteSchema } from "@/lib/validation/create-site-schema";
import { updateSiteSchema } from "@/lib/validation/update-site-schema";
import { updateMarcaSchema } from "@/lib/validation/update-marca-schema";
import { SitioNotFoundError } from "@/application/use-cases/superadmin/add-marca";

export interface CreateLocalActionState {
  error: string | null;
}

export async function createLocalAction(
  _prevState: CreateLocalActionState,
  formData: FormData,
): Promise<CreateLocalActionState> {
  await requireAdmin();

  const sitioId = formData.get("sitioId");
  const nombre = formData.get("nombre");

  if (typeof sitioId !== "string" || !sitioId) {
    return { error: "Sitio inválido." };
  }
  if (typeof nombre !== "string" || nombre.trim().length === 0) {
    return { error: "Ingrese el nombre del local." };
  }

  try {
    await container.createLocal({ sitioId, nombre: nombre.trim() });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/admin/sitios/${sitioId}`);
}

export interface CreateSiteActionState {
  error: string | null;
}

export async function createSiteAction(
  _prevState: CreateSiteActionState,
  formData: FormData,
): Promise<CreateSiteActionState> {
  await requireAdmin();

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

  redirect("/admin/sitios");
}

export interface AddMarcaActionState {
  error: string | null;
}

export async function addMarcaAction(
  _prevState: AddMarcaActionState,
  formData: FormData,
): Promise<AddMarcaActionState> {
  await requireAdmin();

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

  redirect(`/admin/sitios/${siteId}`);
}

export interface GenerateMarcaQrActionState {
  qrCodeId: string | null;
  error: string | null;
}

export async function generateMarcaQrAction(sitioId: string, marcaId: string): Promise<GenerateMarcaQrActionState> {
  await requireAdmin();

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
  await requireAdmin();

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

  redirect(`/admin/sitios/${siteId}`);
}

export interface DeactivateSiteActionState {
  error: string | null;
}

export async function deactivateSiteAction(sitioId: string): Promise<DeactivateSiteActionState> {
  await requireAdmin();

  try {
    await container.deactivateSitio(sitioId);
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/admin/sitios/${sitioId}`);
}

export interface UpdateMarcaActionState {
  error: string | null;
}

export async function updateMarcaAction(
  _prevState: UpdateMarcaActionState,
  formData: FormData,
): Promise<UpdateMarcaActionState> {
  await requireAdmin();

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

  redirect(`/admin/sitios/${sitioId}`);
}

export async function deactivateMarcaAction(sitioId: string, marcaId: string): Promise<{ error: string | null }> {
  await requireAdmin();

  try {
    await container.deactivateMarca({ sitioId, marcaId });
  } catch (error) {
    if (error instanceof SitioNotFoundError) return { error: error.message };
    throw error;
  }

  redirect(`/admin/sitios/${sitioId}`);
}
