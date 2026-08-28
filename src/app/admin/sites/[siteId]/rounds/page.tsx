import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { RecorridoEstado } from "@/domain/entities/recorrido";

const STATUS_LABEL: Record<RecorridoEstado, string> = {
  "en-progreso": "En curso",
  completado: "Completado",
};

export default async function AdminSiteRoundsPage({ params }: PageProps<"/admin/sites/[siteId]/rounds">) {
  const { siteId } = await params;
  const sitio = await container.getSitio(siteId);
  if (!sitio) notFound();

  const rounds = await container.listRoundsBySite(siteId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/sites/${siteId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {sitio.nombre}
        </Link>
        <h1 className="text-lg font-semibold">Recorridos</h1>
      </div>

      {rounds.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay recorridos registrados en este sitio.</p>
      )}

      <div className="flex flex-col gap-2">
        {rounds.map(({ recorrido, guardName }) => {
          const missed = recorrido.registros.filter((registro) => registro.estado === "perdido").length;
          const onTime = recorrido.registros.filter((registro) => registro.estado === "a-tiempo").length;

          return (
            <Link key={recorrido.id} href={`/admin/sites/${siteId}/rounds/${recorrido.id}`} className="block">
              <Card className="transition-colors hover:bg-surface-hover">
                <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Recorrido #{recorrido.secuencia}</CardTitle>
                      <Badge variant={recorrido.estado === "en-progreso" ? "success" : "secondary"}>
                        {STATUS_LABEL[recorrido.estado]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {guardName} · Iniciado {recorrido.iniciadoEn.toLocaleString()}
                    </CardDescription>
                    <CardDescription>
                      {onTime}/{recorrido.registros.length} marcas escaneadas
                      {missed > 0 && ` · ${missed} no escaneadas`}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
