import Link from "next/link";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminSitiosPage() {
  const sitios = await container.listSitios();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Sitios</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {sitios.map((sitio) => (
          <Link key={sitio.id} href={`/admin/sitios/${sitio.id}`} className="block">
            <Card className="transition-colors hover:bg-surface-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sitio.nombre}</CardTitle>
                  <Badge variant={sitio.activo ? "success" : "destructive"}>{sitio.activo ? "Activo" : "Inactivo"}</Badge>
                </div>
                <CardDescription>{sitio.direccion}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                <span className="text-xs font-medium text-foreground">Marcas</span>
                {sitio.marcas.length === 0 ? (
                  <span className="text-xs">Sin marcas registradas.</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {sitio.marcas.map((marca) => (
                      <Badge key={marca.id} variant="secondary">
                        {marca.nombre}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
