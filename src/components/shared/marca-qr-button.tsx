"use client";

import { useRef, useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { downloadDataUrl, qrFileName, svgToPngDataUrl } from "@/lib/qr/svg-to-png";

const QR_EXPORT_SIZE = 512;

export interface MarcaQrButtonProps {
  sitioId: string;
  marca: {
    id: string;
    nombre: string;
    qrCodeId: string | null;
  };
  generateQrAction: (sitioId: string, marcaId: string) => Promise<{ qrCodeId: string | null; error: string | null }>;
}

export function MarcaQrButton({ sitioId, marca, generateQrAction }: MarcaQrButtonProps) {
  const [qrCodeId, setQrCodeId] = useState(marca.qrCodeId);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const svgRef = useRef<SVGSVGElement>(null);

  async function handleDownload() {
    if (!svgRef.current) return;
    setError(null);
    try {
      const dataUrl = await svgToPngDataUrl(svgRef.current, QR_EXPORT_SIZE);
      downloadDataUrl(dataUrl, qrFileName(marca.nombre));
    } catch {
      setError("No se pudo descargar el QR.");
    }
  }

  function handleClick() {
    if (qrCodeId) {
      setIsOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await generateQrAction(sitioId, marca.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setQrCodeId(result.qrCodeId);
      setIsOpen(true);
    });
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "Generando..." : "QR"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR de {marca.nombre}</DialogTitle>
            <DialogDescription>Código único para esta marca.</DialogDescription>
          </DialogHeader>
          {qrCodeId && (
            <>
              <div className="flex justify-center py-2">
                <QRCodeSVG ref={svgRef} value={qrCodeId} size={192} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                Descargar
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
