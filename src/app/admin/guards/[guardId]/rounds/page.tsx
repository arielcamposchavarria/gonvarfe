import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { firstDateParam, parseDateRangeParams, buildDateRangeQuery } from "@/lib/date-range";
import type { RoundStatus } from "@/domain/entities/round";

const STATUS_LABEL: Record<RoundStatus, string> = {
  "in-progress": "En curso",
  completed: "Completado",
};

export default async function AdminGuardRoundsPage({
  params,
  searchParams,
}: PageProps<"/admin/guards/[guardId]/rounds">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const { from, to } = await searchParams;
  const fromParam = firstDateParam(from);
  const toParam = firstDateParam(to);
  const rounds = await container.listGuardRounds(guardId, parseDateRangeParams({ from: fromParam, to: toParam }));
  const exportQuery = buildDateRangeQuery({ from: fromParam, to: toParam });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/admin/guards/${guardId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {detail.guard.name}
          </Link>
          <h1 className="text-lg font-semibold">Recorridos</h1>
        </div>
        <ExportButton href={`/admin/guards/${guardId}/rounds/export${exportQuery}`} />
      </div>

      <DateRangeFilter from={fromParam} to={toParam} />

      {rounds.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard todavía no tiene recorridos registrados.</p>
      )}

      <div className="flex flex-col gap-2">
        {rounds.map(({ round, siteName }) => {
          const missed = round.scans.filter((scan) => scan.status === "missed").length;
          const onTime = round.scans.filter((scan) => scan.status === "on-time").length;

          return (
            <Link key={round.id} href={`/admin/sites/${round.siteId}/rounds/${round.id}`} className="block">
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
                      {siteName} · Iniciado {new Date(round.startedAt).toLocaleString()}
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
