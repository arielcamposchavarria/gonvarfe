import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const sites = await container.listSites();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Sitios</h1>
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
            <CardContent className="text-sm text-muted-foreground">
              {site.stations.length} estaciones configuradas.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
