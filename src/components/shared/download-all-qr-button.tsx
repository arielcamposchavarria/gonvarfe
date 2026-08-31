"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { downloadDataUrl, qrFileName, svgToPngDataUrl } from "@/lib/qr/svg-to-png";
import type { Marca } from "@/domain/entities/sitio";

const QR_EXPORT_SIZE = 512;
/** Espaciado entre descargas: algunos navegadores bloquean varias simultáneas. */
const DOWNLOAD_STAGGER_MS = 200;

export interface DownloadAllQrButtonProps {
  sitioId: string;
  marcas: Marca[];
  generateQrAction: (sitioId: string, marcaId: string) => Promise<{ qrCodeId: string | null; error: string | null }>;
}

export function DownloadAllQrButton({ sitioId, marcas, generateQrAction }: DownloadAllQrButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Marcas con qrCodeId listo para rasterizar, montadas fuera de pantalla. */
  const [pendingExport, setPendingExport] = useState<{ id: string; nombre: string; qrCodeId: string }[] | null>(null);
  const svgRefs = useRef(new Map<string, SVGSVGElement>());

  useEffect(() => {
    if (!pendingExport) return;

    let cancelled = false;
    async function exportAll() {
      for (const marca of pendingExport ?? []) {
        if (cancelled) return;
        const svg = svgRefs.current.get(marca.id);
        if (!svg) continue;
        try {
          const dataUrl = await svgToPngDataUrl(svg, QR_EXPORT_SIZE);
          downloadDataUrl(dataUrl, qrFileName(marca.nombre));
        } catch {
          // Un QR individual fallando no debe detener el resto de la descarga.
        }
        await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_STAGGER_MS));
      }
      if (!cancelled) {
        setPendingExport(null);
        setIsPending(false);
      }
    }
    void exportAll();

    return () => {
      cancelled = true;
    };
  }, [pendingExport]);

  async function handleClick() {
    if (marcas.length === 0) return;
    setError(null);
    setIsPending(true);

    const withQr: { id: string; nombre: string; qrCodeId: string }[] = [];
    for (const marca of marcas) {
      if (marca.qrCodeId) {
        withQr.push({ id: marca.id, nombre: marca.nombre, qrCodeId: marca.qrCodeId });
        continue;
      }
      const result = await generateQrAction(sitioId, marca.id);
      if (result.error || !result.qrCodeId) {
        setError(`No se pudo generar el QR de "${marca.nombre}".`);
        setIsPending(false);
        return;
      }
      withQr.push({ id: marca.id, nombre: marca.nombre, qrCodeId: result.qrCodeId });
    }

    setPendingExport(withQr);
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending || marcas.length === 0}>
        {isPending ? "Descargando..." : "Descargar todos los QR"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Montados fuera de pantalla solo para rasterizarlos; no son visibles. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        {pendingExport?.map((marca) => (
          <QRCodeSVG
            key={marca.id}
            ref={(el) => {
              if (el) svgRefs.current.set(marca.id, el);
              else svgRefs.current.delete(marca.id);
            }}
            value={marca.qrCodeId}
            size={QR_EXPORT_SIZE}
          />
        ))}
      </div>
    </div>
  );
}
