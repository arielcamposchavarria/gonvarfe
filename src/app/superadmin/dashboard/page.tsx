import Link from "next/link";
import { UserPlus } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROLE_LABELS } from "@/domain/value-objects/role";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function SuperAdminDashboardPage() {
  const users = await container.listUsers();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Usuarios del sistema</h1>
        <Button asChild size="sm">
          <Link href="/superadmin/dashboard/new">
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </Link>
        </Button>
      </div>

      <Card className="divide-y divide-border overflow-hidden sm:hidden">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.username} · {ROLE_LABELS[user.role]}
              </p>
            </div>
            <Badge variant={user.isActive ? "success" : "destructive"} className="shrink-0">
              {user.isActive ? "Activo" : "Inactivo"}
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
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Activo" : "Inactivo"}
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
