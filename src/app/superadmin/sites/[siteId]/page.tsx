import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddMarcaForm } from "@/components/shared/add-marca-form";
import { MarcaQrButton } from "@/components/shared/marca-qr-button";
import { EditSiteForm } from "@/components/shared/edit-site-form";
import { DeactivateSiteButton } from "@/components/shared/deactivate-site-button";
import { EditMarcaForm } from "@/components/shared/edit-marca-form";
import { DeactivateMarcaButton } from "@/components/shared/deactivate-marca-button";
import {
  addVisitingLocalAction,
  deactivateMarcaAction,
  deactivateSiteAction,
  generateMarcaQrAction,
  updateMarcaAction,
  updateSiteAction,
} from "@/app/superadmin/sites/actions";

export default async function SuperAdminSiteDetailPage({ params }: PageProps<"/superadmin/sites/[siteId]">) {
  const { siteId } = await params;
  const sitio = await container.getSitio(siteId);
  if (!sitio) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/superadmin/sites"
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
      <div className="flex gap-2">
        <EditSiteForm sitio={sitio} action={updateSiteAction} />
        <DeactivateSiteButton sitioId={sitio.id} activo={sitio.activo} action={deactivateSiteAction} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marcas</CardTitle>
          <CardDescription>Cada marca puede tener un código QR único.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sitio.marcas.length === 0 ? (
            <span className="text-sm text-muted-foreground">Sin marcas registradas.</span>
          ) : (
            <div className="flex flex-col gap-2">
              {sitio.marcas.map((marca) => (
                <div key={marca.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{marca.nombre}</span>
                    <Badge variant={marca.activo ? "success" : "destructive"}>
                      {marca.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <MarcaQrButton sitioId={sitio.id} marca={marca} generateQrAction={generateMarcaQrAction} />
                    <EditMarcaForm sitioId={sitio.id} marca={marca} action={updateMarcaAction} />
                    <DeactivateMarcaButton sitioId={sitio.id} marca={marca} action={deactivateMarcaAction} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddMarcaForm siteId={sitio.id} action={addVisitingLocalAction} />
        </CardContent>
      </Card>
    </div>
  );
}
