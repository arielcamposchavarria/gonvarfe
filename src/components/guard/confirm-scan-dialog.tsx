"use client";

import { useState, useTransition, type FormEvent } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { readFileAsDataUrl } from "@/lib/files/read-file-as-data-url";
import { MAX_LOG_IMAGES } from "@/domain/constants";

export interface ConfirmScanDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (input: { fotos: string[]; observacion: string }) => void;
  isPending: boolean;
}

/**
 * Paso intermedio, opcional, antes de confirmar un escaneo (exitoso o
 * salteado en modo demo): permite adjuntar fotos y una observación de la
 * marca, sin ser obligatorio — "Confirmar" funciona igual vacío.
 */
export function ConfirmScanDialog({ open, onCancel, onConfirm, isPending }: ConfirmScanDialogProps) {
  const [observacion, setObservacion] = useState("");
  const [isReading, startReading] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const photos = new FormData(event.currentTarget)
      .getAll("fotos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .slice(0, MAX_LOG_IMAGES);

    startReading(async () => {
      const fotos = await Promise.all(photos.map(readFileAsDataUrl));
      onConfirm({ fotos, observacion });
      setObservacion("");
    });
  }

  const busy = isPending || isReading;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar marca</DialogTitle>
          <DialogDescription>Puede adjuntar fotos y una observación (opcional) antes de confirmar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ImageUploadField name="fotos" maxFiles={MAX_LOG_IMAGES} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="observacion">Observación (opcional)</Label>
            <Textarea
              id="observacion"
              name="observacion"
              value={observacion}
              onChange={(event) => setObservacion(event.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
