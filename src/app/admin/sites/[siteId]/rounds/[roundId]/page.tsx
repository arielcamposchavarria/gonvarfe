import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";

import { container } from "@/infrastructure/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RecorridoEstado } from "@/domain/entities/recorrido";
import type { RegistroEstado } from "@/domain/entities/registro";

const ROUND_STATUS_LABEL: Record<RecorridoEstado, string> = {
  "en-progreso": "En curso",
  completado: "Completado",
};

const REGISTRO_STATUS_LABEL: Record<RegistroEstado, string> = {
  pendiente: "Pendiente",
  "a-tiempo": "Escaneada a tiempo",
  perdido: "No escaneada",
};

export default async function AdminRoundDetailPage({
  params,
}: PageProps<"/admin/sites/[siteId]/rounds/[roundId]">) {
  const { siteId, roundId } = await params;
  const detail = await container.getRoundDetail(siteId, roundId);
  if (!detail) notFound();

  const { recorrido, guardName, sitio, turnoIniciadoEn } = detail;
  const marcas = new Map(sitio.marcas.map((marca) => [marca.id, marca]));
  const registros = [...recorrido.registros].sort((a, b) => a.orden - b.orden);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/admin/sites/${siteId}/rounds`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Recorridos
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Recorrido #{recorrido.secuencia}</h1>
          <Badge variant={recorrido.estado === "en-progreso" ? "success" : "secondary"}>
            {ROUND_STATUS_LABEL[recorrido.estado]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {guardName} · {sitio.nombre}
        </p>
        {turnoIniciadoEn && (
          <p className="text-sm text-muted-foreground">Turno del {turnoIniciadoEn.toLocaleDateString()}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Iniciado {recorrido.iniciadoEn.toLocaleString()}
          {recorrido.completadoEn && ` · Finalizado ${recorrido.completadoEn.toLocaleString()}`}
        </p>
      </div>

      <Card className="divide-y divide-border overflow-hidden">
        {registros.map((registro) => {
          const marca = marcas.get(registro.marcaId);
          return (
            <div key={registro.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <RegistroStatusIcon estado={registro.estado} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {registro.orden}. {marca?.nombre ?? registro.marcaId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {REGISTRO_STATUS_LABEL[registro.estado]}
                    {registro.escaneadoEn && ` a las ${registro.escaneadoEn.toLocaleTimeString()}`}
                  </p>
                  {registro.motivoPerdido && (
                    <p className="text-xs text-danger">Justificación: {registro.motivoPerdido}</p>
                  )}
                </div>
              </div>
              <p className="pl-8 text-xs text-muted-foreground sm:pl-0">
                Ventana: {registro.abreEn.toLocaleTimeString()} – {registro.cierraEn.toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function RegistroStatusIcon({ estado }: { estado: RegistroEstado }) {
  if (estado === "a-tiempo") return <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />;
  if (estado === "perdido") return <CircleAlert className="h-5 w-5 shrink-0 text-danger" />;
  return <CircleDashed className="h-5 w-5 shrink-0 text-muted-foreground" />;
}
