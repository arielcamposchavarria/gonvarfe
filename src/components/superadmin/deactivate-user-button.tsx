"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmAction, notifySuccess } from "@/lib/confirm";

export interface DeactivateUserButtonProps {
  userId: string;
  userName: string;
  isActive: boolean;
  action: (userId: string) => Promise<{ error: string | null }>;
}

export function DeactivateUserButton({ userId, userName, isActive, action }: DeactivateUserButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isActive) return null;

  async function handleClick() {
    const confirmed = await confirmAction({
      title: `¿Desactivar a ${userName}?`,
      text: "No podrá volver a iniciar sesión hasta que se reactive su cuenta.",
      variant: "destructive",
      confirmText: "Desactivar",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action(userId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await notifySuccess("Usuario desactivado");
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
