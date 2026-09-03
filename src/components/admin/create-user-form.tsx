"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createUserAction, type CreateUserActionState } from "@/app/admin/users/new/actions";
import { ROLE_LABELS, type Role } from "@/domain/value-objects/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface CreateUserFormProps {
  roles: { id: string; name: string }[];
}

const INITIAL_STATE: CreateUserActionState = { error: null };

export function CreateUserForm({ roles }: CreateUserFormProps) {
  const [state, formAction, isPending] = useActionState(createUserAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/admin/users"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
          <CardDescription>
            Crea un usuario y asígnale un rol. Se enviará una contraseña temporal al correo
            ingresado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select id="role" name="role" defaultValue="" required>
                <option value="" disabled>
                  Seleccione...
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {ROLE_LABELS[role.name as Role] ?? role.name}
                  </option>
                ))}
              </Select>
            </div>

            {state.error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar usuario"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
