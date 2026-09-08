"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmAction, notifySuccess } from "@/lib/confirm";

export interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  action: (userId: string) => Promise<{ error: string | null }>;
}

export function DeleteUserButton({ userId, userName, action }: DeleteUserButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    const confirmed = await confirmAction({
      title: `¿Eliminar a ${userName}?`,
      text: "Esta acción es permanente: se borrará por completo la cuenta y no podrá recuperarse.",
      variant: "destructive",
      confirmText: "Eliminar",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const result = await action(userId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await notifySuccess("Usuario eliminado");
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" variant="destructive" size="sm" onClick={handleClick} disabled={isPending}>
        <Trash2 className="h-4 w-4" />
        {isPending ? "Eliminando..." : "Eliminar"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
