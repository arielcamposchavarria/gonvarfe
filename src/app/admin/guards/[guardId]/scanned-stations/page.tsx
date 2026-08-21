import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Card } from "@/components/ui/card";
import { ExportButton } from "@/components/shared/export-button";

export default async function AdminGuardScannedStationsPage({
  params,
}: PageProps<"/admin/guards/[guardId]/scanned-stations">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const scannedStations = await container.listGuardScannedStations(guardId);

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
          <h1 className="text-lg font-semibold">QR escaneados a tiempo</h1>
        </div>
        <ExportButton href={`/admin/guards/${guardId}/scanned-stations/export`} />
      </div>

      {scannedStations.length === 0 && (
        <p className="text-sm text-muted-foreground">Este guard todavía no ha escaneado ninguna estación.</p>
      )}

      <Card className="divide-y divide-border overflow-hidden">
        {scannedStations.map((entry, index) => (
          <div key={index} className="flex items-start gap-3 p-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{entry.stationName}</p>
              <p className="text-xs text-muted-foreground">
                {entry.siteName} · Recorrido #{entry.roundSequence} · {new Date(entry.scannedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
