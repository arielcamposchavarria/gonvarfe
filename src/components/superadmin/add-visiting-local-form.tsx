"use client";

import { useActionState } from "react";

import { addVisitingLocalAction, type AddVisitingLocalActionState } from "@/app/superadmin/sites/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AddVisitingLocalFormProps {
  siteId: string;
}

const INITIAL_STATE: AddVisitingLocalActionState = { error: null };

export function AddVisitingLocalForm({ siteId }: AddVisitingLocalFormProps) {
  const [state, formAction, isPending] = useActionState(addVisitingLocalAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="flex gap-2">
        <Input name="local" placeholder="Nueva marca/local" aria-label="Nueva marca o local" required />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Agregando..." : "Agregar marca"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
