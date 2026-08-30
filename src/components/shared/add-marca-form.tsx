"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AddMarcaFormState {
  error: string | null;
}

export interface AddMarcaFormProps {
  siteId: string;
  action: (state: AddMarcaFormState, formData: FormData) => Promise<AddMarcaFormState>;
}

const INITIAL_STATE: AddMarcaFormState = { error: null };

export function AddMarcaForm({ siteId, action }: AddMarcaFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="flex gap-2">
        <Input name="local" placeholder="Nueva marca" aria-label="Nueva marca" required />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Agregando..." : "Agregar marca"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
