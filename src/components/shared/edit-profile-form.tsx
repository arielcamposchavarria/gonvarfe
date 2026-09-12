"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { notifySuccess } from "@/lib/confirm";
import { useActionSuccess } from "@/lib/hooks/use-action-success";
import type { AppUser } from "@/domain/entities/user";

export interface EditProfileFormState {
  error: string | null;
}

export interface EditProfileFormProps {
  user: AppUser;
  action: (prevState: EditProfileFormState, formData: FormData) => Promise<EditProfileFormState>;
}

const INITIAL_STATE: EditProfileFormState = { error: null };

/**
 * Solo nombre y foto son editables por el propio usuario: username, correo y
 * rol se muestran de solo lectura en ProfileCard, no aparecen aquí.
 */
export function EditProfileForm({ user, action }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useActionSuccess(isPending, Boolean(state.error), () => {
    void notifySuccess("Perfil actualizado", "Tus datos se guardaron correctamente.");
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Editar perfil</CardTitle>
        <CardDescription>El usuario, el correo y el rol no se pueden modificar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>

          <ImageUploadField name="fotoPerfil" maxFiles={1} label="Foto de perfil (opcional)" />

          {state.error && (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
