"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createUserSchema } from "@/lib/validation/create-user-schema";
import { UsernameTakenError, EmailTakenError } from "@/domain/ports/user-repository";
import { fileToDataUrl } from "@/lib/files/file-to-data-url";

export interface CreateUserActionState {
  error: string | null;
}

export async function createUserAction(
  _prevState: CreateUserActionState,
  formData: FormData,
): Promise<CreateUserActionState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const foto = formData.get("fotoPerfil");
  const fotoPerfil = foto instanceof File && foto.size > 0 ? await fileToDataUrl(foto) : undefined;

  try {
    await container.createUser({ ...parsed.data, fotoPerfil });
  } catch (error) {
    if (error instanceof UsernameTakenError || error instanceof EmailTakenError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return { error: null };
}
