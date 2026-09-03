"use client";

import { useActionState } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface AssignGuardSiteFormState {
  error: string | null;
}

export interface AssignGuardSiteFormProps {
  guard: { id: string; name: string; assignedSiteId?: string | null };
  sitios: { id: string; nombre: string }[];
  action: (state: AssignGuardSiteFormState, formData: FormData) => Promise<AssignGuardSiteFormState>;
}

const INITIAL_STATE: AssignGuardSiteFormState = { error: null };

/** Un solo sitio vigente por guardia: reasignar es volver a elegir aquí. */
export function AssignGuardSiteForm({ guard, sitios, action }: AssignGuardSiteFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <MapPin className="h-4 w-4" />
          Asignar sitio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar sitio a {guard.name}</DialogTitle>
          <DialogDescription>El guardia solo verá este sitio al iniciar turno.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="guardId" value={guard.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-site-select">Sitio</Label>
            <Select id="assign-site-select" name="siteId" defaultValue={guard.assignedSiteId ?? ""}>
              <option value="">Sin sitio asignado</option>
              {sitios.map((sitio) => (
                <option key={sitio.id} value={sitio.id}>
                  {sitio.nombre}
                </option>
              ))}
            </Select>
          </div>

          {state.error && (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
