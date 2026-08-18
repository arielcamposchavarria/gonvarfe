import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminGuardsPage() {
  const [guards, sites] = await Promise.all([container.listGuards(), container.listSites()]);
  const siteNameById = new Map(sites.map((site) => [site.id, site.name]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Guardas</h1>

      <Card className="divide-y divide-border overflow-hidden sm:hidden">
        {guards.map((guard) => (
          <div key={guard.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{guard.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {guard.username} · {siteNameById.get(guard.assignedSiteId) ?? guard.assignedSiteId}
              </p>
            </div>
            <Badge variant={guard.isActive ? "success" : "destructive"} className="shrink-0">
              {guard.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        ))}
      </Card>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Sitio asignado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => (
              <TableRow key={guard.id}>
                <TableCell>{guard.name}</TableCell>
                <TableCell>{guard.username}</TableCell>
                <TableCell>{siteNameById.get(guard.assignedSiteId) ?? guard.assignedSiteId}</TableCell>
                <TableCell>
                  <Badge variant={guard.isActive ? "success" : "destructive"}>
                    {guard.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
