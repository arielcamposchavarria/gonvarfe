"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reportarPerdidoAction } from "@/app/guard/actions";

export interface ReportMissedDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: (error: string | null) => void;
}

/**
 * El backend siempre resuelve el registro objetivo actual (el pendiente de
 * menor orden), así que este diálogo no necesita saber a qué marca
 * corresponde — solo envía el motivo.
 */
export function ReportMissedDialog({ open, onClose, onSubmitted }: ReportMissedDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await reportarPerdidoAction(reason);
      setReason("");
      onSubmitted(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No pude escanear esta marca</DialogTitle>
          <DialogDescription>Indique el motivo. Luego podrá continuar con la siguiente marca.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={3}
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
