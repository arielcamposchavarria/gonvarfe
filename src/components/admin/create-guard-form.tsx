"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createGuardAction, type CreateGuardActionState } from "@/app/admin/guards/new/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const INITIAL_STATE: CreateGuardActionState = { error: null };

export function CreateGuardForm() {
  const [state, formAction, isPending] = useActionState(createGuardAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-3">
      <Link href="/admin/guards" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Nuevo oficial</CardTitle>
          <CardDescription>Crea un usuario de guard. El sitio lo elige al iniciar cada turno.</CardDescription>
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
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {state.error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar oficial"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
