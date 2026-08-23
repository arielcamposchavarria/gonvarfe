import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { firstDateParam, parseDateRangeParams, buildDateRangeQuery } from "@/lib/date-range";

export default async function AdminGuardEntryLogsPage({
  params,
  searchParams,
}: PageProps<"/admin/guards/[guardId]/entry-logs">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const { from, to } = await searchParams;
  const fromParam = firstDateParam(from);
  const toParam = firstDateParam(to);
  const entryLogs = await container.listGuardEntryLogs(
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
          <h1 className="text-lg font-semibold">Bitácora de ingresos</h1>
        </div>
        <ExportButton href={`/admin/guards/${guardId}/entry-logs/export${exportQuery}`} />
      </div>

      <DateRangeFilter from={fromParam} to={toParam} />

      {entryLogs.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard todavía no ha registrado ingresos.</p>
      )}

      <div className="flex flex-col gap-2">
        {entryLogs.map(({ log, siteName }) => (
          <Card key={log.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{log.driverName}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {log.date} · {log.entryTime}–{log.exitTime}
                </span>
              </div>
              <CardDescription>Sitio: {siteName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Cédula:</span> {log.cedula}
              </p>
              <p>
                <span className="text-muted-foreground">Placa:</span> {log.plate}
              </p>
              <p>
                <span className="text-muted-foreground">Empresa:</span> {log.company || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Local visitado:</span> {log.visitingLocal}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Motivo:</span> {log.reason}
              </p>
              {log.observations && (
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Observaciones:</span> {log.observations}
                </p>
              )}
              {log.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 sm:col-span-2">
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
