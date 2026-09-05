"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export interface QrScanCameraProps {
  onDecode: (value: string) => void;
}

type CameraState = "starting" | "active" | "permission-denied" | "no-camera" | "error";

/** Tras este tiempo activa sin decodificar nada, se muestra un aviso con sugerencias (no es un error, solo UX). */
const STRUGGLE_HINT_DELAY_MS = 8000;

/**
 * Único lugar del código que toca `getUserMedia`/cámara. Un botón
 * deshabilitado por ventana es solo UX — el servidor siempre revalida QR y
 * ventana; esta cámara solo decodifica y entrega el valor leído.
 */
export function QrScanCamera({ onDecode }: QrScanCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [state, setState] = useState<CameraState>("starting");
  const [strugglingToScan, setStrugglingToScan] = useState(false);

  // Ref en vez de dependencia directa: si `onDecode` cambia de identidad en
  // cada render del padre (p. ej. porque un hook como `useNow` lo hace tickear
  // cada segundo) no queremos reiniciar la cámara — eso apagaba/prendía el
  // stream de video constantemente e impedía escanear en dispositivos reales.
  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    let cancelled = false;
    let struggleTimer: ReturnType<typeof setTimeout> | undefined;

    async function setup() {
      const hasCamera = await QrScanner.hasCamera();
      if (cancelled) return;
      if (!hasCamera) {
        setState("no-camera");
        return;
      }
      if (!videoRef.current) return;

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (cancelled) return;
          clearTimeout(struggleTimer);
          setStrugglingToScan(false);
          onDecodeRef.current(result.data);
        },
        {
          returnDetailedScanResult: true,
          onDecodeError: (error) => {
            // "No QR code found" se dispara docenas de veces por segundo
            // mientras no hay un código en cuadro — es el caso normal, no un
            // error. Cualquier otro valor sí es un fallo real del motor de
            // escaneo (worker o BarcodeDetector) que, con el manejador por
            // defecto de la librería, solo hace un console.log silencioso:
            // en un celular sin devtools remotos conectados eso es invisible
            // y la cámara se queda viva sin escanear nunca, sin ninguna
            // pista de qué pasó. Se sube a console.error para poder
            // encontrarlo con Chrome remote debugging / Safari Web Inspector.
            if (error === QrScanner.NO_QR_CODE_FOUND) return;
            console.error("QrScanCamera: error al decodificar", error);
          },
        },
      );
      scannerRef.current = scanner;

      try {
        await scanner.start();
        if (cancelled) return;
        setState("active");
        struggleTimer = setTimeout(() => {
          if (!cancelled) setStrugglingToScan(true);
        }, STRUGGLE_HINT_DELAY_MS);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof Error && error.name === "NotAllowedError") {
          setState("permission-denied");
        } else if (error instanceof Error && error.name === "NotFoundError") {
          setState("no-camera");
        } else {
          setState("error");
        }
      }
    }

    void setup();

    return () => {
      cancelled = true;
      clearTimeout(struggleTimer);
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      </div>
      {state === "starting" && <p className="text-sm text-muted-foreground">Iniciando cámara...</p>}
      {state === "active" && strugglingToScan && (
        <p className="text-xs text-muted-foreground">
          ¿No logra escanear? Acerque más el código, mejore la iluminación, o use &quot;Omitir escaneo&quot;.
        </p>
      )}
      {state === "permission-denied" && (
        <p role="alert" className="text-sm text-danger">
          Permiso de cámara denegado. Habilítelo en la configuración del navegador, o use &quot;Omitir escaneo&quot;.
        </p>
      )}
      {state === "no-camera" && (
        <p role="alert" className="text-sm text-danger">
          No se encontró una cámara disponible. Use &quot;Omitir escaneo&quot; para continuar.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-sm text-danger">
          No se pudo iniciar la cámara. Use &quot;Omitir escaneo&quot; para continuar.
        </p>
      )}
    </div>
  );
}
