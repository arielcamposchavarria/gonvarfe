import Link from "next/link";
import { Plus } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddVisitingLocalForm } from "@/components/superadmin/add-visiting-local-form";

export default async function SuperAdminSitesPage() {
  const sites = await container.listSites();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Sitios</h1>
        <Button asChild size="sm">
          <Link href="/superadmin/sites/new">
            <Plus className="h-4 w-4" />
            Nuevo sitio
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{site.name}</CardTitle>
                <Badge variant={site.isActive ? "success" : "destructive"}>{site.isActive ? "Activo" : "Inactivo"}</Badge>
              </div>
              <CardDescription>{site.address}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              {[...site.stations]
                .sort((a, b) => a.order - b.order)
                .map((station) => (
                  <span key={station.id}>
                    {station.order}. {station.name}
                  </span>
                ))}

              <div className="flex flex-col gap-1 border-t border-border pt-2">
                <span className="text-xs font-medium text-foreground">Marcas/locales</span>
                {site.visitingLocals.length === 0 ? (
                  <span className="text-xs">Sin marcas registradas.</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {site.visitingLocals.map((local) => (
                      <Badge key={local} variant="secondary">
                        {local}
                      </Badge>
                    ))}
                  </div>
                )}
                <AddVisitingLocalForm siteId={site.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
