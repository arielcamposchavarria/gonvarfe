import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RoundStatus } from "@/domain/entities/round";
import type { StationScanStatus } from "@/domain/entities/station-scan";

const ROUND_STATUS_LABEL: Record<RoundStatus, string> = {
  "in-progress": "En curso",
  completed: "Completado",
};

const SCAN_STATUS_LABEL: Record<StationScanStatus, string> = {
  pending: "Pendiente",
  "on-time": "Escaneada a tiempo",
  missed: "No escaneada",
};

export default async function AdminRoundDetailPage({
  params,
}: PageProps<"/admin/sites/[siteId]/rounds/[roundId]">) {
  const { siteId, roundId } = await params;
  const detail = await container.getRoundDetail(siteId, roundId);
  if (!detail) notFound();

  const { round, guardName, site } = detail;
  const stations = new Map(site.stations.map((station) => [station.id, station]));
  const scans = [...round.scans].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/sites/${siteId}/rounds`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Recorridos
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Recorrido #{round.sequence}</h1>
          <Badge variant={round.status === "in-progress" ? "success" : "secondary"}>
            {ROUND_STATUS_LABEL[round.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {guardName} · {site.name}
        </p>
        <p className="text-sm text-muted-foreground">
          Iniciado {new Date(round.startedAt).toLocaleString()}
          {round.completedAt && ` · Finalizado ${new Date(round.completedAt).toLocaleString()}`}
        </p>
      </div>

      <Card className="divide-y divide-border overflow-hidden">
        {scans.map((scan) => {
          const station = stations.get(scan.stationId);
          return (
            <div key={scan.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ScanStatusIcon status={scan.status} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {scan.order}. {station?.name ?? scan.stationId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {SCAN_STATUS_LABEL[scan.status]}
                    {scan.scannedAt && ` a las ${new Date(scan.scannedAt).toLocaleTimeString()}`}
                  </p>
                  {scan.missedReport && (
                    <p className="text-xs text-danger">Justificación: {scan.missedReport.reason}</p>
                  )}
                </div>
              </div>
              <p className="pl-8 text-xs text-muted-foreground sm:pl-0">
                Ventana: {new Date(scan.window.opensAt).toLocaleTimeString()} –{" "}
                {new Date(scan.window.closesAt).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function ScanStatusIcon({ status }: { status: StationScanStatus }) {
  if (status === "on-time") return <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />;
  if (status === "missed") return <CircleAlert className="h-5 w-5 shrink-0 text-danger" />;
  return <CircleDashed className="h-5 w-5 shrink-0 text-muted-foreground" />;
}
