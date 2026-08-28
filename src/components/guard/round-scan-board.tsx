"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, CircleDashed, LogOut, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrScanCamera } from "./qr-scan-camera";
import { ReportMissedDialog } from "./report-missed-dialog";
import { registrarEscaneoAction, finalizarTurnoAction } from "@/app/guard/actions";
import { useNow } from "@/lib/hooks/use-now";
import { cn } from "@/lib/utils";
import { hasWindowOpened, isWindowExpired } from "@/domain/value-objects/time-window";
import { NOTIFY_BEFORE_WINDOW_CLOSE_MINUTES } from "@/domain/constants";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { RegistroEstado } from "@/domain/entities/registro";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

export interface RoundScanBoardProps {
  sitio: GuardSitio;
  recorridoActivo: Recorrido | null;
  recorridosCompletados: number;
}

const STATUS_LABEL: Record<RegistroEstado, string> = {
  pendiente: "Pendiente",
  "a-tiempo": "Escaneada",
  perdido: "No escaneada",
};

type ActionResult = { error: string | null };

export function RoundScanBoard({ sitio, recorridoActivo, recorridosCompletados }: RoundScanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReportingMissed, setIsReportingMissed] = useState(false);
  const now = useNow();
  const router = useRouter();

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  function handleSkip() {
    run(() => registrarEscaneoAction({ skip: true }));
  }

  function handleDecoded(qrValue: string) {
    setIsCameraOpen(false);
    run(() => registrarEscaneoAction({ qrValue, skip: false }));
  }

  function handleFinalizarTurno() {
    setError(null);
    startTransition(async () => {
      const result = await finalizarTurnoAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/guard/select-site");
    });
  }

  const marcaById = new Map(sitio.marcas.map((marca) => [marca.id, marca]));
  const registros = recorridoActivo ? [...recorridoActivo.registros].sort((a, b) => a.orden - b.orden) : [];
  const target = registros.find((registro) => registro.estado === "pendiente") ?? null;
  // Fin del recorrido: la hora ya la cierra el ultimo registro (todos con
  // la misma duracion, repartida en partes iguales desde iniciadoEn).
  const finEstimado = registros.length > 0 ? registros[registros.length - 1].cierraEn : null;

  const targetWindow = target ? { opensAt: target.abreEn, closesAt: target.cierraEn } : null;
  const targetOpen = targetWindow ? hasWindowOpened(targetWindow, new Date(now)) : false;
  const targetClosingSoon =
    targetWindow && targetOpen && target && !isWindowExpired(targetWindow, new Date(now))
      ? target.cierraEn.getTime() - now <= NOTIFY_BEFORE_WINDOW_CLOSE_MINUTES * 60_000
      : false;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="truncate">{sitio.nombre}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {recorridosCompletados} recorridos
            </Badge>
          </div>
          {recorridoActivo && (
            <CardDescription>
              Recorrido iniciado a las {recorridoActivo.iniciadoEn.toLocaleTimeString()}
              {finEstimado && ` · Fin estimado ${finEstimado.toLocaleTimeString()}`}
            </CardDescription>
          )}
          {recorridoActivo && <RoundProgress registros={registros} />}
        </CardHeader>
      </Card>

      {!target ? (
        <Card>
          <CardHeader>
            <CardTitle>{recorridoActivo ? "Recorrido completado" : "Iniciar recorrido"}</CardTitle>
            <CardDescription>
              {recorridoActivo
                ? "Este recorrido ya se completó. Continúe con un nuevo recorrido o finalice el turno."
                : "Escanee la primera marca del sitio para comenzar el recorrido."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => setIsCameraOpen(true)} disabled={isPending}>
              <QrCode className="h-4 w-4" />
              Escanear
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={isPending}>
              Omitir escaneo (demo)
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleFinalizarTurno} disabled={isPending}>
              <LogOut className="h-4 w-4" />
              Finalizar turno
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {registros.map((registro) => {
            const marca = marcaById.get(registro.marcaId);
            const isTarget = registro.id === target.id;
            return (
              <div
                key={registro.id}
                data-testid={`registro-${registro.orden}`}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <RegistroStatusIcon estado={registro.estado} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{marca?.nombre ?? registro.marcaId}</p>
                    <p className="text-xs text-muted-foreground">
                      {registro.estado === "pendiente"
                        ? `Desde las ${registro.abreEn.toLocaleTimeString()}`
                        : STATUS_LABEL[registro.estado]}
                    </p>
                    {isTarget && targetClosingSoon && (
                      <p className="text-xs text-danger">Cierra pronto: {registro.cierraEn.toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
                {isTarget && (
                  <div className="flex flex-wrap gap-2 pl-8 sm:pl-0">
                    <Button size="sm" disabled={!targetOpen || isPending} onClick={() => setIsCameraOpen(true)}>
                      Escanear
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending} onClick={handleSkip}>
                      Omitir (demo)
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => setIsReportingMissed(true)}>
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

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear código QR</DialogTitle>
            <DialogDescription>Apunte la cámara al QR de la marca.</DialogDescription>
          </DialogHeader>
          {isCameraOpen && <QrScanCamera onDecode={handleDecoded} />}
        </DialogContent>
      </Dialog>

      <ReportMissedDialog
        open={isReportingMissed}
        onClose={() => setIsReportingMissed(false)}
        onSubmitted={(submitError) => {
          setIsReportingMissed(false);
          if (submitError) setError(submitError);
        }}
      />
    </div>
  );
}

function RoundProgress({ registros }: { registros: Recorrido["registros"] }) {
  return (
    <div className="flex gap-1 pt-1">
      {registros.map((registro) => (
        <div
          key={registro.id}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            registro.estado === "a-tiempo" && "bg-accent",
            registro.estado === "perdido" && "bg-danger",
            registro.estado === "pendiente" && "bg-border",
          )}
        />
      ))}
    </div>
  );
}

function RegistroStatusIcon({ estado }: { estado: RegistroEstado }) {
  if (estado === "a-tiempo") return <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />;
  if (estado === "perdido") return <CircleAlert className="h-5 w-5 shrink-0 text-danger" />;
  return <CircleDashed className="h-5 w-5 shrink-0 text-muted-foreground" />;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
