import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ExportButtonProps {
  href: string;
  label?: string;
}

/** Descarga el reporte en Excel; el navegador maneja la descarga vía el route handler enlazado. */
export function ExportButton({ href, label = "Exportar a Excel" }: ExportButtonProps) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} download>
        <Download className="h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
