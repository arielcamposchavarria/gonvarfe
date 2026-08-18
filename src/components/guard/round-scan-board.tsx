"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CircleAlert, CircleDashed, LogOut, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportMissedDialog } from "./report-missed-dialog";
import { startShiftAction, scanStationAction, endShiftAction } from "@/app/guard/actions";
import { useNow } from "@/lib/hooks/use-now";
import { cn } from "@/lib/utils";
import type { Round } from "@/domain/entities/round";
import type { StationScanStatus } from "@/domain/entities/station-scan";
import type { Site } from "@/domain/entities/site";
import type { ShiftSession } from "@/domain/entities/shift-session";

export interface RoundScanBoardProps {
  site: Site;
  session: ShiftSession | null;
  activeRound: Round | null;
  completedRoundsCount: number;
}

const STATUS_LABEL: Record<StationScanStatus, string> = {
  pending: "Pendiente",
  "on-time": "Escaneada",
  missed: "No escaneada",
};

type ActionResult = { error: string | null };

export function RoundScanBoard({ site, session, activeRound, completedRoundsCount }: RoundScanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reportingStationId, setReportingStationId] = useState<string | null>(null);
  const now = useNow();

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  if (!session || session.status === "completed") {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{site.name}</CardTitle>
            <CardDescription>
              {session?.status === "completed"
                ? "Jornada finalizada. Escanee el QR de inicio para comenzar una nueva jornada."
                : "Escanee el QR de inicio para comenzar su jornada."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full" onClick={() => run(startShiftAction)} disabled={isPending}>
              <QrCode className="h-4 w-4" />
              Escanear QR de inicio
            </Button>
          </CardContent>
        </Card>
        {error && <ErrorBanner message={error} />}
      </div>
    );
  }

  const stations = [...site.stations].sort((a, b) => a.order - b.order);
  const firstStation = stations[0];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="truncate">{site.name}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {completedRoundsCount} recorridos
            </Badge>
          </div>
          <CardDescription>Jornada iniciada a las {new Date(session.startedAt).toLocaleTimeString()}</CardDescription>
          {activeRound && <RoundProgress scans={activeRound.scans} />}
        </CardHeader>
      </Card>

      {!activeRound ? (
        <Card>
          <CardHeader>
            <CardTitle>Recorrido completado</CardTitle>
            <CardDescription>
              Escanee el QR de inicio para comenzar el siguiente recorrido, o el QR de salida si terminó su jornada.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => run(() => scanStationAction(firstStation.id))}
              disabled={isPending}
            >
              <QrCode className="h-4 w-4" />
              Nuevo recorrido
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => run(endShiftAction)} disabled={isPending}>
              <LogOut className="h-4 w-4" />
              Finalizar jornada
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {activeRound.scans.map((scan) => {
            const station = stations.find((s) => s.id === scan.stationId);
            const opensAt = new Date(scan.window.opensAt);
            const canScan = scan.status === "pending" && now >= opensAt.getTime();
            return (
              <div
                key={scan.id}
                data-testid={`station-scan-${scan.order}`}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <StationStatusIcon status={scan.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{station?.name ?? scan.stationId}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.status === "pending"
                        ? `Desde las ${opensAt.toLocaleTimeString()}`
                        : STATUS_LABEL[scan.status]}
                    </p>
                  </div>
                </div>
                {scan.status === "pending" && (
                  <div className="flex gap-2 pl-8 sm:pl-0">
                    <Button
                      size="sm"
                      disabled={!canScan || isPending}
                      onClick={() => run(() => scanStationAction(scan.stationId))}
                    >
                      Escanear
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setReportingStationId(scan.stationId)}
                    >
                      No pude escanear
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {error && <ErrorBanner message={error} />}

      <ReportMissedDialog
        stationId={reportingStationId}
        onClose={() => setReportingStationId(null)}
        onSubmitted={(submitError) => {
          setReportingStationId(null);
          if (submitError) setError(submitError);
        }}
      />
    </div>
  );
}

function RoundProgress({ scans }: { scans: Round["scans"] }) {
  return (
    <div className="flex gap-1 pt-1">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            scan.status === "on-time" && "bg-accent",
            scan.status === "missed" && "bg-danger",
            scan.status === "pending" && "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function StationStatusIcon({ status }: { status: StationScanStatus }) {
  if (status === "on-time") return <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />;
  if (status === "missed") return <CircleAlert className="h-5 w-5 shrink-0 text-danger" />;
  return <CircleDashed className="h-5 w-5 shrink-0 text-muted-foreground" />;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
