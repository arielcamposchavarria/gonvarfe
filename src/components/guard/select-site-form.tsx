"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { iniciarTurnoAction } from "@/app/guard/actions";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

export interface SelectSiteFormProps {
  /** Único sitio vigente del guardia: lo asigna el admin, el guardia no elige entre varios. */
  sitio: GuardSitio;
}

/**
 * Sin persistencia de sitio elegido en cookie/cliente: cada turno se inicia
 * explícitamente aquí, y `GET /turnos/activo` sigue siendo la única fuente
 * de verdad de "qué sitio cubre este guard ahora".
 */
export function SelectSiteForm({ sitio }: SelectSiteFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await iniciarTurnoAction(sitio.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/guard/dashboard");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Su sitio asignado</h1>
        <p className="text-sm text-muted-foreground">Inicie su turno en el sitio que le asignó el administrador.</p>
      </div>

      <button type="button" disabled={isPending} onClick={handleStart} className="text-left">
        <Card className="transition-colors hover:bg-surface-hover">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-accent">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base">{sitio.nombre}</CardTitle>
              <CardDescription>{sitio.direccion}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </button>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
