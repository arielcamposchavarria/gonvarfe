import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CircleAlert } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Card } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { firstDateParam, parseDateRangeParams, buildDateRangeQuery } from "@/lib/date-range";

export default async function AdminGuardMissedScansPage({
  params,
  searchParams,
}: PageProps<"/admin/guards/[guardId]/missed-scans">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const { from, to } = await searchParams;
  const fromParam = firstDateParam(from);
  const toParam = firstDateParam(to);
  const missedScans = await container.listGuardMissedScans(
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
          <h1 className="text-lg font-semibold">QR no escaneados</h1>
        </div>
        <ExportButton
          href={`/admin/guards/${guardId}/missed-scans/export${exportQuery}`}
          excelLabel="Descargar Justificación"
          pdfLabel="Descargar Justificación (PDF)"
        />
      </div>

      <DateRangeFilter from={fromParam} to={toParam} />

      {missedScans.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard no tiene estaciones sin escanear.</p>
      )}

      <Card className="divide-y divide-border overflow-hidden">
        {missedScans.map((entry, index) => (
          <div key={index} className="flex items-start gap-3 p-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{entry.stationName}</p>
              <p className="text-xs text-muted-foreground">
                {entry.siteName} · Recorrido #{entry.roundSequence} · {new Date(entry.reportedAt).toLocaleString()}
              </p>
              <p className="text-sm text-danger">Justificación: {entry.reason}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
