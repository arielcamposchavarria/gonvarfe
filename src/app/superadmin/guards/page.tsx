import { container } from "@/infrastructure/container";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AssignGuardSiteForm } from "@/components/superadmin/assign-guard-site-form";
import { assignGuardSiteAction } from "./actions";

export default async function SuperAdminGuardsPage() {
  const [guards, sitios] = await Promise.all([container.listGuards(), container.listSitios()]);
  const sitioById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Guardias</h1>

      <Card className="divide-y divide-border overflow-hidden sm:hidden">
        {guards.map((guard) => (
          <div key={guard.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{guard.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {guard.assignedSiteId ? sitioById.get(guard.assignedSiteId) ?? "Sitio desconocido" : "Sin sitio asignado"}
              </p>
            </div>
            <AssignGuardSiteForm guard={guard} sitios={sitios} action={assignGuardSiteAction} />
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => (
              <TableRow key={guard.id}>
                <TableCell>{guard.name}</TableCell>
                <TableCell>{guard.username}</TableCell>
                <TableCell>
                  {guard.assignedSiteId ? sitioById.get(guard.assignedSiteId) ?? "Sitio desconocido" : "Sin sitio asignado"}
                </TableCell>
                <TableCell>
                  <AssignGuardSiteForm guard={guard} sitios={sitios} action={assignGuardSiteAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
