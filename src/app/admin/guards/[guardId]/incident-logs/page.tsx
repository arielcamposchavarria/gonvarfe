import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { firstDateParam, parseDateRangeParams, buildDateRangeQuery } from "@/lib/date-range";
import { formatDateTimeCR } from "@/lib/format-date";

export default async function AdminGuardIncidentLogsPage({
  params,
  searchParams,
}: PageProps<"/admin/guards/[guardId]/incident-logs">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const { from, to } = await searchParams;
  const fromParam = firstDateParam(from);
  const toParam = firstDateParam(to);
  const incidentLogs = await container.listGuardIncidentLogs(
    guardId,
    parseDateRangeParams({ from: fromParam, to: toParam }),
  );
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
          <h1 className="text-lg font-semibold">Bitácora de incidencias</h1>
        </div>
        <ExportButton href={`/admin/guards/${guardId}/incident-logs/export${exportQuery}`} />
      </div>

      <DateRangeFilter from={fromParam} to={toParam} />

      {incidentLogs.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard todavía no ha reportado incidencias.</p>
      )}

      <div className="flex flex-col gap-2">
        {incidentLogs.map(({ log, siteName }) => (
          <Card key={log.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{log.locationZone}</CardTitle>
                <Badge variant="destructive">
                  {log.incidentType === "Otro" && log.incidentTypeDetail ? log.incidentTypeDetail : log.incidentType}
                </Badge>
              </div>
              <CardDescription>
                {siteName} · {formatDateTimeCR(new Date(log.occurredAt))}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p>{log.description}</p>
              {log.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {log.photoUrls.map((url, index) => (
                    // eslint-disable-next-line @next/next/no-img-element -- imagen adjunta guardada como data: URL, no un asset del sitio
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
