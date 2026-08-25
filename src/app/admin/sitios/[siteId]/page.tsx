import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateLocalForm } from "@/components/admin/create-local-form";

export default async function AdminSitioDetailPage({ params }: PageProps<"/admin/sitios/[siteId]">) {
  const { siteId } = await params;
  const sitio = await container.getSitio(siteId);
  if (!sitio) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/sitios"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{sitio.nombre}</h1>
        <Badge variant={sitio.activo ? "success" : "destructive"}>{sitio.activo ? "Activo" : "Inactivo"}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{sitio.direccion}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marcas</CardTitle>
          <CardDescription>Solo de consulta.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locales</CardTitle>
          <CardDescription>Locales comerciales dentro del sitio.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sitio.locales.length === 0 ? (
            <span className="text-sm text-muted-foreground">Sin locales registrados.</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {sitio.locales.map((local) => (
                <Badge key={local.id} variant="secondary">
                  {local.nombre}
                </Badge>
              ))}
            </div>
          )}

          <CreateLocalForm sitioId={sitio.id} />
        </CardContent>
      </Card>
    </div>
  );
}
