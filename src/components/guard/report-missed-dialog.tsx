"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { reportMissedScanAction } from "@/app/guard/actions";

export interface ReportMissedDialogProps {
  stationId: string | null;
  onClose: () => void;
  onSubmitted: (error: string | null) => void;
}

export function ReportMissedDialog({ stationId, onClose, onSubmitted }: ReportMissedDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stationId) return;
    const currentStationId = stationId;
    startTransition(async () => {
      const result = await reportMissedScanAction(currentStationId, reason);
      setReason("");
      onSubmitted(result.error);
    });
  }

  return (
    <Dialog open={stationId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No pude escanear esta estación</DialogTitle>
          <DialogDescription>Indique el motivo. Luego podrá continuar con la siguiente estación.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motivo</Label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={3}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Reportar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
