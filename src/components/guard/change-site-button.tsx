"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { finalizarTurnoAction } from "@/app/guard/actions";
import { Button } from "@/components/ui/button";

export interface ChangeSiteButtonProps {
  /** Solo se puede cambiar de sitio si no hay un recorrido en progreso. */
  disabled: boolean;
}

export function ChangeSiteButton({ disabled }: ChangeSiteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await finalizarTurnoAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/guard/select-site");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={disabled || isPending}>
        <Building2 className="h-4 w-4" />
        Cambiar de sitio
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
