import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ExportButtonProps {
  href: string;
  excelLabel?: string;
  pdfLabel?: string;
}

/**
 * Descarga el reporte en Excel o PDF; el navegador maneja la descarga vía el
 * mismo route handler, distinguido por el query param `format`.
 */
export function ExportButton({ href, excelLabel = "Descargar Excel", pdfLabel = "Descargar PDF" }: ExportButtonProps) {
  const pdfHref = `${href}${href.includes("?") ? "&" : "?"}format=pdf`;

  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={href} download>
          <Download className="h-4 w-4" />
          {excelLabel}
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={pdfHref} download>
          <Download className="h-4 w-4" />
          {pdfLabel}
        </a>
      </Button>
    </div>
  );
}
