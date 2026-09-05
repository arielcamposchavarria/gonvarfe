"use client";

import { useState } from "react";
import { ChevronLeft, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface PhotosDialogProps {
  fotos: string[];
  title: string;
  description?: string;
}

/** Botón "Ver fotos" que abre un diálogo con el grid de imágenes; tocar una la agranda a pantalla completa. */
export function PhotosDialog({ fotos, title, description }: PhotosDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);

  if (fotos.length === 0) return null;

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setEnlargedIndex(null);
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <ImageIcon className="h-4 w-4" />
        Ver fotos ({fotos.length})
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className={enlargedIndex !== null ? "max-w-2xl" : undefined}>
          {enlargedIndex !== null ? (
            <>
              <DialogHeader>
                <button
                  type="button"
                  onClick={() => setEnlargedIndex(null)}
                  className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Volver
                </button>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen adjunta guardada como data: URL, no un asset del sitio */}
              <img
                src={fotos[enlargedIndex]}
                alt={`Foto ${enlargedIndex + 1}`}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {fotos.map((foto, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setEnlargedIndex(index)}
                    className="aspect-square w-full overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
                    aria-label={`Agrandar foto ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- imagen adjunta guardada como data: URL, no un asset del sitio */}
                    <img src={foto} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
