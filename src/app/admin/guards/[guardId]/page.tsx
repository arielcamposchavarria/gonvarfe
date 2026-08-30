import { notFound } from "next/navigation";
import { CircleAlert, ClipboardList, ListChecks, QrCode, ShieldAlert } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OptionCard } from "@/components/shared/option-card";
import { ExportButton } from "@/components/shared/export-button";

export default async function AdminGuardDetailPage({ params }: PageProps<"/admin/guards/[guardId]">) {
  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) notFound();

  const { guard, currentSite, totals } = detail;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{guard.name}</h1>
            <Badge variant={guard.isActive ? "success" : "destructive"}>
              {guard.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{guard.username}</p>
        </div>
        <ExportButton
          href={`/admin/guards/${guard.id}/export`}
          excelLabel="Excel: todo"
          pdfLabel="PDF: todo"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado actual</CardTitle>
          <CardDescription>
            {currentSite ? (
              <>
                Actualmente en <span className="font-medium text-foreground">{currentSite.nombre}</span>
              </>
            ) : (
              "No ha iniciado turno"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-2">
        <OptionCard
          href={`/admin/guards/${guard.id}/scanned-stations`}
          icon={QrCode}
          title="QR escaneados a tiempo"
          description="Marcas escaneadas dentro de su ventana"
          badgeLabel={String(totals.scansOnTime)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/guards/${guard.id}/rounds`}
          icon={ListChecks}
          title="Recorridos completados"
          description="Reportes de las vueltas realizadas"
          badgeLabel={String(totals.roundsCompleted)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/guards/${guard.id}/missed-scans`}
          icon={CircleAlert}
          title="QR no escaneados"
          description="Marcas no escaneadas y su motivo"
          badgeLabel={String(totals.scansMissed)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/guards/${guard.id}/entry-logs`}
          icon={ClipboardList}
          title="Bitácora de ingresos"
          description="Registros de visitas y vehículos"
          badgeLabel={String(totals.entryLogsCount)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/guards/${guard.id}/incident-logs`}
          icon={ShieldAlert}
          title="Bitácora de incidencias"
          description="Novedades reportadas durante los turnos"
          badgeLabel={String(totals.incidentLogsCount)}
          badgeVariant="secondary"
        />
      </div>
    </div>
  );
}
