"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, CircleDashed, LogOut, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrScanCamera } from "./qr-scan-camera";
import { ReportMissedDialog } from "./report-missed-dialog";
import { ConfirmScanDialog } from "./confirm-scan-dialog";
import { registrarEscaneoAction, finalizarTurnoAction } from "@/app/guard/actions";
import { confirmAction, notifyError, notifySuccess } from "@/lib/confirm";
import type { EscanearInput } from "@/domain/ports/recorrido-repository";
import { useNow } from "@/lib/hooks/use-now";
import { cn } from "@/lib/utils";
import { NOTIFY_BEFORE_ROUND_CLOSE_MINUTES } from "@/domain/constants";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { RegistroEstado } from "@/domain/entities/registro";
import type { GuardSitio } from "@/domain/entities/guard-sitio";
import type { RegistroPendienteAnterior } from "@/application/use-cases/guard/obtener-estado-turno";

export interface RoundScanBoardProps {
  sitio: GuardSitio;
  recorridoActivo: Recorrido | null;
  recorridosCompletados: number;
  /** Marcas pendientes de recorridos anteriores (ya vencidos) de este mismo turno, a justificar. */
  pendientesRecorridoAnterior: RegistroPendienteAnterior[];
}

const STATUS_LABEL: Record<RegistroEstado, string> = {
  pendiente: "Pendiente",
  "a-tiempo": "Escaneada",
  perdido: "No escaneada",
};

type ActionResult = { error: string | null };

type ReportTarget = "current" | RegistroPendienteAnterior;

export function RoundScanBoard({
  sitio,
  recorridoActivo,
  recorridosCompletados,
  pendientesRecorridoAnterior,
}: RoundScanBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [pendingScan, setPendingScan] = useState<EscanearInput | null>(null);
  const now = useNow();
  const router = useRouter();
  const refreshedRoundId = useRef<string | null>(null);

  function run(action: () => Promise<ActionResult>, successTitle?: string) {
    startTransition(async () => {
      const result = await action();
      // Un SweetAlert es más visible que el banner rojo de abajo para un
      // rechazo de escaneo (QR fuera de orden, ventana vencida, etc.) — con
      // la cámara todavía abierta encima, el guard fácilmente no lo notaría.
      if (result.error) {
        await notifyError("No se pudo registrar el escaneo", result.error);
        return;
      }
      // Igual de importante en el otro sentido: sin esto, la única señal de
      // que el escaneo sí quedó registrado era que el diálogo se cerraba —
      // fácil de perder si el guard ya estaba guardando el teléfono.
      if (successTitle) await notifySuccess(successTitle);
    });
  }

  function handleSkip() {
    setPendingScan({ skip: true });
  }

  function handleDecoded(qrValue: string) {
    setIsCameraOpen(false);
    setPendingScan({ qrValue, skip: false });
  }

  function handleConfirmScan(extra: { fotos: string[]; observacion: string }) {
    if (!pendingScan) return;
    const input: EscanearInput = {
      ...pendingScan,
      fotos: extra.fotos.length > 0 ? extra.fotos : undefined,
      observacion: extra.observacion.trim() || undefined,
    };
    setPendingScan(null);
    run(() => registrarEscaneoAction(input), input.skip ? "Registro omitido" : "Escaneo registrado");
  }

  async function handleFinalizarTurno() {
    const confirmed = await confirmAction({
      title: "¿Finalizar el turno?",
      text: "No podrá seguir escaneando ni reportando en este turno.",
      variant: "destructive",
      confirmText: "Finalizar",
    });
    if (!confirmed) return;

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
  // la misma duracion, repartida en partes iguales desde iniciadoEn). Ya no
  // hay restriccion de tiempo por marca — esta es la unica hora que se
  // respeta: pasada, el recorrido vence.
  const finEstimado = registros.length > 0 ? registros[registros.length - 1].cierraEn : null;

  const msHastaFin = finEstimado ? finEstimado.getTime() - now : null;
  const cierraPronto =
    Boolean(recorridoActivo) && msHastaFin !== null && msHastaFin > 0 && msHastaFin <= NOTIFY_BEFORE_ROUND_CLOSE_MINUTES * 60_000;
  const siguienteRecorridoEstimado = finEstimado
    ? new Date(finEstimado.getTime() + NOTIFY_BEFORE_ROUND_CLOSE_MINUTES * 60_000)
    : null;

  // Cuando se cumple el tiempo total del recorrido y quedan marcas sin
  // escanear, el servidor lo marca "vencido" en la siguiente consulta — acá
  // se dispara esa consulta automaticamente (una sola vez por recorrido)
  // para que la pantalla vuelva sola a "iniciar recorrido / finalizar turno".
  useEffect(() => {
    if (!recorridoActivo || !target || !finEstimado) return;
    if (now === 0 || now < finEstimado.getTime()) return;
    if (refreshedRoundId.current === recorridoActivo.id) return;
    refreshedRoundId.current = recorridoActivo.id;
    router.refresh();
  }, [now, recorridoActivo, target, finEstimado, router]);

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

      {cierraPronto && finEstimado && (
        <p role="status" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {target
            ? `El recorrido está por finalizar a las ${finEstimado.toLocaleTimeString()} y tienes marcas pendientes por escanear.`
            : `El siguiente recorrido inicia aproximadamente a las ${siguienteRecorridoEstimado?.toLocaleTimeString()}.`}
        </p>
      )}

      {pendientesRecorridoAnterior.length > 0 && (
        <Card className="border-danger/40" data-testid="pendientes-recorrido-anterior">
          <CardHeader>
            <CardTitle>Marcas pendientes de un recorrido anterior</CardTitle>
            <CardDescription>
              Estas marcas quedaron sin escanear cuando venció el tiempo del recorrido anterior. Repórtelas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendientesRecorridoAnterior.map((pendiente) => {
              const marca = marcaById.get(pendiente.registro.marcaId);
              return (
                <div
                  key={pendiente.registro.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{marca?.nombre ?? pendiente.registro.marcaId}</p>
                    <p className="text-xs text-muted-foreground">
                      Hora estimada: {pendiente.registro.abreEn.toLocaleTimeString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => setReportTarget(pendiente)}>
                    No pude escanear
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" className="flex-1" disabled={isPending} onClick={() => setReportTarget("current")}>
              No pude escanear
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
                        ? `Hora estimada: ${registro.abreEn.toLocaleTimeString()}`
                        : STATUS_LABEL[registro.estado]}
                    </p>
                  </div>
                </div>
                {isTarget && (
                  <div className="flex flex-wrap gap-2 pl-8 sm:pl-0">
                    <Button size="sm" disabled={isPending} onClick={() => setIsCameraOpen(true)}>
                      Escanear
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending} onClick={handleSkip}>
                      Omitir (demo)
                    </Button>
                    <Button size="sm" variant="outline" disabled={isPending} onClick={() => setReportTarget("current")}>
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
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSubmitted={(submitError) => {
          setReportTarget(null);
          if (submitError) setError(submitError);
        }}
        target={
          reportTarget && reportTarget !== "current"
            ? {
                recorridoId: reportTarget.recorridoId,
                registroId: reportTarget.registro.id,
                marcaNombre: marcaById.get(reportTarget.registro.marcaId)?.nombre,
              }
            : undefined
        }
      />

      <ConfirmScanDialog
        open={pendingScan !== null}
        onCancel={() => setPendingScan(null)}
        onConfirm={handleConfirmScan}
        isPending={isPending}
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
