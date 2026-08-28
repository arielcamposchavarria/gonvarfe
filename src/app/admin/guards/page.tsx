import Link from "next/link";
import { UserPlus } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function AdminGuardsPage() {
  const guards = await container.listGuards();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Guardas</h1>
        <Button asChild size="sm">
          <Link href="/admin/guards/new">
            <UserPlus className="h-4 w-4" />
            Nuevo oficial
          </Link>
        </Button>
      </div>

      <Card className="divide-y divide-border overflow-hidden sm:hidden">
        {guards.map((guard) => (
          <Link key={guard.id} href={`/admin/guards/${guard.id}`} className="block">
            <div className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-hover">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{guard.name}</p>
                <p className="truncate text-xs text-muted-foreground">{guard.username}</p>
              </div>
              <Badge variant={guard.isActive ? "success" : "destructive"} className="shrink-0">
                {guard.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </Link>
        ))}
      </Card>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => (
              <TableRow key={guard.id} className="cursor-pointer">
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
                    <Badge variant={guard.isActive ? "success" : "destructive"}>
                      {guard.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
