"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SitioNotFoundError } from "@/application/use-cases/admin/create-local";

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
