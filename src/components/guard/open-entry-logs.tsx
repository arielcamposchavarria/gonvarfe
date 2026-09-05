"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registrarSalidaAction } from "@/app/guard/logs/entry/actions";
import { confirmAction, notifySuccess } from "@/lib/confirm";
import type { EntryLog } from "@/domain/entities/entry-log";

export interface OpenEntryLogsProps {
  /** Ya filtrados a exitTime === null por el server component padre. */
  logs: EntryLog[];
}

/** Ingresos ya registrados a los que aún les falta la hora de salida. */
export function OpenEntryLogs({ logs }: OpenEntryLogsProps) {
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = logs.filter((log) => !closedIds.includes(log.id));
  if (visible.length === 0) return null;

  async function handleSalida(logId: string) {
    const confirmed = await confirmAction({
      title: "¿Registrar la salida?",
      text: "No podrá deshacer esta acción.",
    });
    if (!confirmed) return;

    setError(null);
    setPendingId(logId);
    startTransition(async () => {
      const result = await registrarSalidaAction(logId);
      if (result.error) {
        setError(result.error);
      } else {
        setClosedIds((ids) => [...ids, logId]);
        await notifySuccess("Salida registrada");
      }
      setPendingId(null);
    });
  }

  return (
    <Card className="divide-y divide-border overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Ingresos abiertos</CardTitle>
        <CardDescription>Registre la salida cuando el visitante se retire.</CardDescription>
      </CardHeader>
      {visible.map((log) => (
        <div key={log.id} className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{log.driverName}</p>
            <p className="text-xs text-muted-foreground">Ingresó a las {log.entryTime}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending && pendingId === log.id}
            onClick={() => handleSalida(log.id)}
          >
            <LogOut className="h-4 w-4" />
            Salida
          </Button>
        </div>
      ))}
      {error && (
        <p role="alert" className="px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </Card>
  );
}
