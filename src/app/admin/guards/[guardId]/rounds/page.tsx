import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { firstDateParam, parseDateRangeParams, buildDateRangeQuery } from "@/lib/date-range";
import { groupRoundsByTurno } from "@/lib/group-rounds-by-turno";
import { formatDateCR, formatDateTimeCR } from "@/lib/format-date";
import type { RecorridoEstado } from "@/domain/entities/recorrido";

const STATUS_LABEL: Record<RecorridoEstado, string> = {
  "en-progreso": "En curso",
  completado: "Completado",
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
      <p className="-mt-2 text-xs text-muted-foreground">El filtro de fechas aplica sobre el día en que inició cada turno.</p>

      {rounds.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard todavía no tiene recorridos registrados.</p>
      )}

      <div className="flex flex-col gap-4">
        {groupRoundsByTurno(rounds).map((group) => (
          <div key={group.turnoId} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Turno del {formatDateCR(group.turnoIniciadoEn)} · {group.items[0].siteName}
              <Badge variant="secondary">{group.items.length} recorridos</Badge>
            </div>
            <div className="flex flex-col gap-2 pl-6">
              {group.items.map(({ recorrido, siteName }) => {
                const missed = recorrido.registros.filter((registro) => registro.estado === "perdido").length;
                const onTime = recorrido.registros.filter((registro) => registro.estado === "a-tiempo").length;

                return (
                  <Link
                    key={recorrido.id}
                    href={`/admin/sites/${recorrido.sitioId}/rounds/${recorrido.id}`}
                    className="block"
                  >
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
                            {siteName} · Iniciado {formatDateTimeCR(recorrido.iniciadoEn)}
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
        ))}
      </div>
    </div>
  );
}
