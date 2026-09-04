"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmAction } from "@/lib/confirm";

export interface ForceFinalizeTurnoButtonProps {
  siteId: string;
  turnoId: string;
  guardName: string;
  action: (siteId: string, turnoId: string) => Promise<{ error: string | null }>;
}

/** Botón de admin para cerrar el turno de un guardia, aunque le queden marcas sin escanear en el recorrido en curso. */
export function ForceFinalizeTurnoButton({ siteId, turnoId, guardName, action }: ForceFinalizeTurnoButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    const confirmed = await confirmAction({
      title: "¿Finalizar este turno?",
      text: `Se cerrará el turno de ${guardName} aunque el recorrido en curso tenga marcas sin escanear. Esta acción no se puede deshacer.`,
      variant: "destructive",
      confirmText: "Finalizar turno",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action(siteId, turnoId);
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="destructive" size="sm" onClick={handleClick} disabled={isPending}>
        <LogOut className="h-4 w-4" />
        {isPending ? "Finalizando..." : "Finalizar turno"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
