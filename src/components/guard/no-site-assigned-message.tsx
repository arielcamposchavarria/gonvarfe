import { Building2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface NoSiteAssignedMessageProps {
  /** "unassigned": nunca se le asignó un sitio. "unavailable": el que tenía ya no está disponible. */
  variant?: "unassigned" | "unavailable";
}

export function NoSiteAssignedMessage({ variant = "unassigned" }: NoSiteAssignedMessageProps) {
  const description =
    variant === "unassigned"
      ? "Todavía no tienes un sitio asignado. Comunícate con el administrador para que te asignen uno."
      : "El sitio que tenías asignado ya no está disponible. Comunícate con el administrador para que te asignen uno nuevo.";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Sin sitio asignado</h1>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-accent">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">No tienes un sitio asignado</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
