"use client";

import { useActionState } from "react";

import { createLocalAction, type CreateLocalActionState } from "@/app/admin/sitios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CreateLocalFormProps {
  sitioId: string;
}

const INITIAL_STATE: CreateLocalActionState = { error: null };

export function CreateLocalForm({ sitioId }: CreateLocalFormProps) {
  const [state, formAction, isPending] = useActionState(createLocalAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="sitioId" value={sitioId} />
      <div className="flex gap-2">
        <Input name="nombre" placeholder="Nuevo local" aria-label="Nuevo local" required />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Agregando..." : "Agregar local"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
