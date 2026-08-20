"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { submitEntryLogAction, type EntryLogActionState } from "@/app/guard/logs/entry/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploadField } from "@/components/shared/image-upload-field";

export interface EntryLogFormProps {
  visitingLocals: string[];
}

const INITIAL_STATE: EntryLogActionState = { error: null };

export function EntryLogForm({ visitingLocals }: EntryLogFormProps) {
  const [state, formAction, isPending] = useActionState(submitEntryLogAction, INITIAL_STATE);
  const [defaultDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [defaultTime] = useState(() => new Date().toTimeString().slice(0, 5));

  return (
    <div className="flex flex-col gap-3">
      <Link href="/guard/dashboard" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Bitácora de ingreso</CardTitle>
          <CardDescription>Registro de visitas y vehículos que ingresan al sitio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="entryTime">Hora ingreso</Label>
                  <Input id="entryTime" name="entryTime" type="time" defaultValue={defaultTime} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="exitTime">Hora salida</Label>
                  <Input id="exitTime" name="exitTime" type="time" defaultValue={defaultTime} required />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plate">Placa</Label>
                <Input id="plate" name="plate" placeholder="ABC123" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="driverName">Conductor</Label>
                <Input id="driverName" name="driverName" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cedula">Cédula (9 dígitos)</Label>
                <Input id="cedula" name="cedula" inputMode="numeric" maxLength={9} placeholder="123456789" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" name="company" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input id="reason" name="reason" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="visitingLocal">Local que visita</Label>
                <Select id="visitingLocal" name="visitingLocal" defaultValue="" required>
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  {visitingLocals.map((local) => (
                    <option key={local} value={local}>
                      {local}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea id="observations" name="observations" rows={3} />
            </div>

            <ImageUploadField name="photos" maxFiles={5} />

            {state.error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar registro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
