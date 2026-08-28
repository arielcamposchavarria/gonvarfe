"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MarcaTagInput } from "@/components/shared/marca-tag-input";

export interface CreateSiteFormState {
  error: string | null;
}

export interface CreateSiteFormProps {
  action: (state: CreateSiteFormState, formData: FormData) => Promise<CreateSiteFormState>;
  backHref: string;
}

const INITIAL_STATE: CreateSiteFormState = { error: null };

export function CreateSiteForm({ action, backHref }: CreateSiteFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-3">
      <Link href={backHref} className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Nuevo sitio</CardTitle>
          <CardDescription>Crea un sitio y sus marcas visitables.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre del sitio</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" required />
            </div>

            <MarcaTagInput name="visitingLocals" label="Marcas" />

            {state.error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar sitio"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
