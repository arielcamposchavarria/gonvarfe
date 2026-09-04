"use client";

import { useState, useTransition, type FormEvent } from "react";
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
import { notifySuccess } from "@/lib/confirm";

export interface AssignGuardSiteFormState {
  error: string | null;
}

export interface AssignGuardSiteFormProps {
  guard: { id: string; name: string; assignedSiteId?: string | null };
  sitios: { id: string; nombre: string }[];
  action: (guardId: string, siteId: string | null) => Promise<AssignGuardSiteFormState>;
}

/**
 * Un solo sitio vigente por guardia: reasignar es volver a elegir aquí.
 *
 * El diálogo es controlado (no `useActionState` + `<form action>`) a
 * propósito: así se puede cerrar explícitamente tras un guardado exitoso.
 * Antes se quedaba abierto y, si el admin lo reabría más tarde, el `<select>`
 * (con `defaultValue`, que solo se aplica al montar) podía mostrar el sitio
 * ANTERIOR si el remount no alcanzaba a ver las props ya actualizadas —
 * confuso porque volver a pulsar "Guardar" ahí reasignaba el sitio viejo.
 * Cerrar al guardar, más la `key` atada al sitio asignado, eliminan esa
 * ventana de inconsistencia.
 */
export function AssignGuardSiteForm({ guard, sitios, action }: AssignGuardSiteFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawSiteId = formData.get("siteId");
    const siteId = typeof rawSiteId === "string" && rawSiteId !== "" ? rawSiteId : null;

    setError(null);
    startTransition(async () => {
      const result = await action(guard.id, siteId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      await notifySuccess("Sitio asignado", `Se actualizó el sitio de ${guard.name}.`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-site-select">Sitio</Label>
            <Select
              id="assign-site-select"
              name="siteId"
              key={guard.assignedSiteId ?? "none"}
              defaultValue={guard.assignedSiteId ?? ""}
            >
              <option value="">Sin sitio asignado</option>
              {sitios.map((sitio) => (
                <option key={sitio.id} value={sitio.id}>
                  {sitio.nombre}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
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
