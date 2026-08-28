"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export interface QrScanCameraProps {
  onDecode: (value: string) => void;
}

type CameraState = "starting" | "active" | "permission-denied" | "no-camera" | "error";

/**
 * Único lugar del código que toca `getUserMedia`/cámara. Un botón
 * deshabilitado por ventana es solo UX — el servidor siempre revalida QR y
 * ventana; esta cámara solo decodifica y entrega el valor leído.
 */
export function QrScanCamera({ onDecode }: QrScanCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [state, setState] = useState<CameraState>("starting");

  useEffect(() => {
    let cancelled = false;

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
          if (!cancelled) onDecode(result.data);
        },
        { returnDetailedScanResult: true },
      );
      scannerRef.current = scanner;

      try {
        await scanner.start();
        if (!cancelled) setState("active");
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
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [onDecode]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      </div>
      {state === "starting" && <p className="text-sm text-muted-foreground">Iniciando cámara...</p>}
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
