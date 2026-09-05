"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmAction, notifySuccess } from "@/lib/confirm";

export interface DeactivateSiteButtonProps {
  sitioId: string;
  activo: boolean;
  action: (sitioId: string) => Promise<{ error: string | null }>;
}

export function DeactivateSiteButton({ sitioId, activo, action }: DeactivateSiteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!activo) return null;

  async function handleClick() {
    const confirmed = await confirmAction({
      title: "¿Desactivar este sitio?",
      variant: "destructive",
      confirmText: "Desactivar",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action(sitioId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await notifySuccess("Sitio desactivado");
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
