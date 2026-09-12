"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateProfileSchema } from "@/lib/validation/update-profile-schema";
import { fileToDataUrl } from "@/lib/files/file-to-data-url";
import { IncorrectCurrentPasswordError } from "@/domain/ports/account-repository";

export interface ProfileActionState {
  error: string | null;
}

const OK: ProfileActionState = { error: null };

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  await requireAdmin();

  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const foto = formData.get("fotoPerfil");
  const fotoPerfil = foto instanceof File && foto.size > 0 ? await fileToDataUrl(foto) : undefined;

  try {
    await container.updateOwnProfile({ name: parsed.data.name, fotoPerfil });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el perfil." };
  }

  revalidatePath("/admin/profile");
  return OK;
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ProfileActionState> {
  await requireAdmin();

  try {
    await container.changePassword(input);
  } catch (error) {
    if (error instanceof IncorrectCurrentPasswordError) {
      return { error: error.message };
    }
    return { error: error instanceof Error ? error.message : "No se pudo cambiar la contraseña." };
  }

  return OK;
}
