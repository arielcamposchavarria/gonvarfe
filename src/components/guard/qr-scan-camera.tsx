"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Flashlight, FlashlightOff } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

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
      // Todo lo que toca la cámara va en un mismo try/catch: `hasCamera()`
      // también puede lanzar (p. ej. `navigator.mediaDevices` es `undefined`
      // en un origen inseguro — http a una IP de LAN en vez de localhost/
      // https, el caso típico al probar desde un celular). Antes solo
      // `scanner.start()` estaba cubierto, así que ese fallo quedaba como
      // una promesa rechazada sin manejar y la UI se quedaba en "Iniciando
      // cámara..." para siempre, sin ningún mensaje para el guard.
      try {
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
            // Cámara trasera explícita: en algunos Android, sin esto, el
            // navegador a veces arrancaba con la frontal. Los overlays dan
            // feedback visual de dónde apuntar y cuándo detectó el QR —
            // sin esto el guard apuntaba "a ciegas" y muchos reportaban que
            // "no agarraba" cuando en realidad apuntaban fuera del recuadro
            // de escaneo real.
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
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
              //
              // La ruta nativa de BarcodeDetector (qr-scanner.min.js) envuelve
              // el sentinel en un catch propio y relanza `Scanner error: No QR
              // code found` en vez del valor exacto — probado en Android/
              // Chrome real. Con comparación estricta, cada frame sin QR (la
              // mayoría, mientras se apunta la cámara) se registraba como
              // error real, y en dev eso disparaba el overlay de errores de
              // Next.js tapando la pantalla en cada frame: parecía que el
              // escaneo no funcionaba, cuando en realidad sí decodificaba.
              const message = typeof error === "string" ? error : error.message;
              if (message.includes(QrScanner.NO_QR_CODE_FOUND)) return;
              console.error("QrScanCamera: error al decodificar", error);
            },
          },
        );
        scannerRef.current = scanner;

        await scanner.start();
        if (cancelled) return;
        setState("active");
        struggleTimer = setTimeout(() => {
          if (!cancelled) setStrugglingToScan(true);
        }, STRUGGLE_HINT_DELAY_MS);

        // No todos los dispositivos con linterna resuelven esta promesa
        // igual de rápido (o la resuelven), así que no bloquea el resto del
        // arranque de la cámara: es solo un botón extra si aplica.
        scanner
          .hasFlash()
          .then((supported) => {
            if (!cancelled) setHasFlash(supported);
          })
          .catch(() => {
            // Sin linterna detectable: se omite el botón, no es un error.
          });
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

  async function handleToggleFlash() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.toggleFlash();
      setFlashOn(scanner.isFlashOn());
    } catch {
      // Algunos dispositivos reportan `hasFlash()` true pero fallan al
      // togglear (p. ej. mientras el navegador aún negocia el stream): se
      // ignora, el guard puede seguir escaneando sin linterna.
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      </div>
      {state === "starting" && <p className="text-sm text-muted-foreground">Iniciando cámara...</p>}
      {state === "active" && hasFlash && (
        <Button type="button" variant="outline" size="sm" onClick={handleToggleFlash}>
          {flashOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
          {flashOn ? "Apagar linterna" : "Encender linterna"}
        </Button>
      )}
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
