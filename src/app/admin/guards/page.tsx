import Link from "next/link";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AssignGuardSiteForm } from "@/components/admin/assign-guard-site-form";
import { assignGuardSiteAction } from "./actions";

export default async function AdminGuardsPage() {
  const [guards, sitios] = await Promise.all([container.listGuards(), container.listSitios()]);
  const sitioById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Guardas</h1>
      </div>

      <Card className="divide-y divide-border overflow-hidden sm:hidden">
        {guards.map((guard) => (
          <div key={guard.id} className="flex items-center justify-between gap-3 p-3">
            <Link href={`/admin/guards/${guard.id}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{guard.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {guard.assignedSiteId ? sitioById.get(guard.assignedSiteId) ?? "Sitio desconocido" : "Sin sitio asignado"}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={guard.isActive ? "success" : "destructive"}>
                {guard.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <AssignGuardSiteForm guard={guard} sitios={sitios} action={assignGuardSiteAction} />
            </div>
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => (
              <TableRow key={guard.id}>
                <TableCell className="p-0">
                  <Link href={`/admin/guards/${guard.id}`} className="block p-3">
                    {guard.name}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/admin/guards/${guard.id}`} className="block p-3">
                    {guard.username}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/admin/guards/${guard.id}`} className="block p-3">
                    {guard.assignedSiteId ? sitioById.get(guard.assignedSiteId) ?? "Sitio desconocido" : "Sin sitio asignado"}
                  </Link>
                </TableCell>
                <TableCell className="p-0">
                  <Link href={`/admin/guards/${guard.id}`} className="block p-3">
                    <Badge variant={guard.isActive ? "success" : "destructive"}>
                      {guard.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Link>
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
