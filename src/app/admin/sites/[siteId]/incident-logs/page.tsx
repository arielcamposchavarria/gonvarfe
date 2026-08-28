import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function AdminSiteIncidentLogsPage({
  params,
}: PageProps<"/admin/sites/[siteId]/incident-logs">) {
  const { siteId } = await params;
  const sitio = await container.getSitio(siteId);
  if (!sitio) notFound();

  const incidentLogs = await container.listIncidentLogsBySite(siteId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/sites/${siteId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {sitio.nombre}
        </Link>
        <h1 className="text-lg font-semibold">Bitácora de incidencias</h1>
      </div>

      {incidentLogs.length === 0 && (
        <p className="text-sm text-muted-foreground">Todavía no hay incidencias reportadas en este sitio.</p>
      )}

      <div className="flex flex-col gap-2">
        {incidentLogs.map(({ log, guardName }) => (
          <Card key={log.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{log.locationZone}</CardTitle>
                <Badge variant="destructive">
                  {log.incidentType === "Otro" && log.incidentTypeDetail ? log.incidentTypeDetail : log.incidentType}
                </Badge>
              </div>
              <CardDescription>
                {guardName} · {log.occurredAt.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p>{log.description}</p>
              {log.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {log.photoUrls.map((url, index) => (
                    // eslint-disable-next-line @next/next/no-img-element -- imagen adjunta guardada como data: URL, no un asset del sitio
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
