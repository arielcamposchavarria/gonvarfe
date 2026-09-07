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

export interface EditSiteFormState {
  error: string | null;
}

export interface EditSiteFormProps {
  sitio: { id: string; nombre: string; direccion: string };
  action: (state: EditSiteFormState, formData: FormData) => Promise<EditSiteFormState>;
}

const INITIAL_STATE: EditSiteFormState = { error: null };

export function EditSiteForm({ sitio, action }: EditSiteFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [open, setOpen] = useState(false);

  useActionSuccess(isPending, Boolean(state.error), () => {
    setOpen(false);
    void notifySuccess("Sitio actualizado");
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
          <DialogTitle>Editar sitio</DialogTitle>
          <DialogDescription>Actualiza el nombre y la dirección del sitio.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="siteId" value={sitio.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-site-name">Nombre del sitio</Label>
            <Input id="edit-site-name" name="name" defaultValue={sitio.nombre} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-site-address">Dirección</Label>
            <Input id="edit-site-address" name="address" defaultValue={sitio.direccion} required />
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
