"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { notifySuccess } from "@/lib/confirm";
import { useActionSuccess } from "@/lib/hooks/use-action-success";

export interface EditMarcaFormState {
  error: string | null;
}

export interface EditMarcaFormProps {
  sitioId: string;
  marca: { id: string; nombre: string };
  action: (state: EditMarcaFormState, formData: FormData) => Promise<EditMarcaFormState>;
}

const INITIAL_STATE: EditMarcaFormState = { error: null };

export function EditMarcaForm({ sitioId, marca, action }: EditMarcaFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [open, setOpen] = useState(false);

  useActionSuccess(isPending, Boolean(state.error), () => {
    setOpen(false);
    void notifySuccess("Marca actualizada");
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar marca</DialogTitle>
          <DialogDescription>Actualiza el nombre de la marca.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="sitioId" value={sitioId} />
          <input type="hidden" name="marcaId" value={marca.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor={`edit-marca-name-${marca.id}`}>Nombre de la marca</Label>
            <Input id={`edit-marca-name-${marca.id}`} name="name" defaultValue={marca.nombre} required />
          </div>

          {state.error && (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
