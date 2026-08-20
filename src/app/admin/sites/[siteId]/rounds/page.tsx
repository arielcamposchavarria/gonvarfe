import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { RoundStatus } from "@/domain/entities/round";

const STATUS_LABEL: Record<RoundStatus, string> = {
  "in-progress": "En curso",
  completed: "Completado",
};

export default async function AdminSiteRoundsPage({ params }: PageProps<"/admin/sites/[siteId]/rounds">) {
  const { siteId } = await params;
  const site = await container.getSite(siteId);
  if (!site) notFound();

  const rounds = await container.listRoundsBySite(siteId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/sites/${siteId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {site.name}
        </Link>
        <h1 className="text-lg font-semibold">Recorridos</h1>
      </div>

      {rounds.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay recorridos registrados en este sitio.</p>
      )}

      <div className="flex flex-col gap-2">
        {rounds.map(({ round, guardName }) => {
          const missed = round.scans.filter((scan) => scan.status === "missed").length;
          const onTime = round.scans.filter((scan) => scan.status === "on-time").length;

          return (
            <Link key={round.id} href={`/admin/sites/${siteId}/rounds/${round.id}`} className="block">
              <Card className="transition-colors hover:bg-surface-hover">
                <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Recorrido #{round.sequence}</CardTitle>
                      <Badge variant={round.status === "in-progress" ? "success" : "secondary"}>
                        {STATUS_LABEL[round.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {guardName} · Iniciado {new Date(round.startedAt).toLocaleString()}
                    </CardDescription>
                    <CardDescription>
                      {onTime}/{round.scans.length} estaciones escaneadas
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
