"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmAction, notifySuccess } from "@/lib/confirm";

export interface DeactivateMarcaButtonProps {
  sitioId: string;
  marca: { id: string; activo: boolean };
  action: (sitioId: string, marcaId: string) => Promise<{ error: string | null }>;
}

export function DeactivateMarcaButton({ sitioId, marca, action }: DeactivateMarcaButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!marca.activo) return null;

  async function handleClick() {
    const confirmed = await confirmAction({
      title: "¿Desactivar esta marca?",
      variant: "destructive",
      confirmText: "Desactivar",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action(sitioId, marca.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      await notifySuccess("Marca desactivada");
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" variant="destructive" size="sm" onClick={handleClick} disabled={isPending}>
        <Ban className="h-4 w-4" />
        {isPending ? "Desactivando..." : "Desactivar"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
