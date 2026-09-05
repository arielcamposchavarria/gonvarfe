"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface PhotosDialogProps {
  fotos: string[];
  title: string;
  description?: string;
}

/** Botón "Ver fotos" que abre un diálogo con el grid de imágenes a tamaño completo. */
export function PhotosDialog({ fotos, title, description }: PhotosDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (fotos.length === 0) return null;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <ImageIcon className="h-4 w-4" />
        Ver fotos ({fotos.length})
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fotos.map((foto, index) => (
              // eslint-disable-next-line @next/next/no-img-element -- imagen adjunta guardada como data: URL, no un asset del sitio
              <img
                key={index}
                src={foto}
                alt={`Foto ${index + 1}`}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
