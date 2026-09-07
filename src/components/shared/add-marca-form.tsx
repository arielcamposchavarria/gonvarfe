"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifySuccess } from "@/lib/confirm";
import { useActionSuccess } from "@/lib/hooks/use-action-success";

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
  const formRef = useRef<HTMLFormElement>(null);

  useActionSuccess(isPending, Boolean(state.error), () => {
    formRef.current?.reset();
    void notifySuccess("Marca agregada");
  });

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
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
