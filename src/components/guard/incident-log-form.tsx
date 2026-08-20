"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { submitIncidentLogAction, type IncidentLogActionState } from "@/app/guard/logs/incident/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { INCIDENT_TYPES } from "@/domain/value-objects/incident-type";

const INITIAL_STATE: IncidentLogActionState = { error: null };

export function IncidentLogForm() {
  const [state, formAction, isPending] = useActionState(submitIncidentLogAction, INITIAL_STATE);

  return (
    <div className="flex flex-col gap-3">
      <Link href="/guard/dashboard" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Bitácora de incidencias</CardTitle>
          <CardDescription>Reporte de novedades importantes durante el turno.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="incidentType">Tipo de incidencia</Label>
              <Select id="incidentType" name="incidentType" defaultValue="" required>
                <option value="" disabled>
                  Seleccione...
                </option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="locationZone">Local o zona</Label>
              <Input id="locationZone" name="locationZone" placeholder="Ej. Parqueo, entrada principal..." required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>

            <ImageUploadField name="photos" maxFiles={5} />

            {state.error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar reporte"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
