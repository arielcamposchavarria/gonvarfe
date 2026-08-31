"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { reportarPerdidoAction } from "@/app/guard/actions";
import { readFileAsDataUrl } from "@/lib/files/read-file-as-data-url";
import { MAX_LOG_IMAGES } from "@/domain/constants";

export interface ReportMissedDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: (error: string | null) => void;
}

/**
 * El backend siempre resuelve el registro objetivo actual (el pendiente de
 * menor orden), así que este diálogo no necesita saber a qué marca
 * corresponde — solo envía el motivo (y, opcionalmente, fotos).
 */
export function ReportMissedDialog({ open, onClose, onSubmitted }: ReportMissedDialogProps) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const photos = new FormData(event.currentTarget)
      .getAll("fotos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, MAX_LOG_IMAGES);

    startTransition(async () => {
      const fotos = await Promise.all(photos.map(readFileAsDataUrl));
      const result = await reportarPerdidoAction({ motivo: reason, fotos });
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
          <ImageUploadField name="fotos" maxFiles={MAX_LOG_IMAGES} />
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
