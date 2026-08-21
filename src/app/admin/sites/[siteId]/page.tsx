import { notFound } from "next/navigation";
import { ClipboardList, ListChecks, ShieldAlert } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OptionCard } from "@/components/shared/option-card";

export default async function AdminSiteDetailPage({ params }: PageProps<"/admin/sites/[siteId]">) {
  const { siteId } = await params;
  const site = await container.getSite(siteId);
  if (!site) notFound();

  const [rounds, entryLogs, incidentLogs] = await Promise.all([
    container.listRoundsBySite(siteId),
    container.listEntryLogsBySite(siteId),
    container.listIncidentLogsBySite(siteId),
  ]);

  const stations = [...site.stations].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{site.name}</h1>
          <Badge variant={site.isActive ? "success" : "destructive"}>{site.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{site.address}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estaciones del recorrido</CardTitle>
          <CardDescription>{stations.length} estaciones configuradas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          {stations.map((station) => (
            <span key={station.id}>
              {station.order}. {station.name}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <OptionCard
          href={`/admin/sites/${site.id}/rounds`}
          icon={ListChecks}
          title="Recorridos"
          description="Reportes de las vueltas realizadas por los guardas"
          badgeLabel={String(rounds.length)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/sites/${site.id}/entry-logs`}
          icon={ClipboardList}
          title="Bitácora de ingresos"
          description="Registro de visitas y vehículos"
          badgeLabel={String(entryLogs.length)}
          badgeVariant="secondary"
        />
        <OptionCard
          href={`/admin/sites/${site.id}/incident-logs`}
          icon={ShieldAlert}
          title="Bitácora de incidencias"
          description="Novedades reportadas durante los turnos"
          badgeLabel={String(incidentLogs.length)}
          badgeVariant="secondary"
        />
      </div>
    </div>
  );
}
