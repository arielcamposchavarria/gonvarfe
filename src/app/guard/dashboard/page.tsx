import { redirect } from "next/navigation";
import { ClipboardList, ListChecks, QrCode, ShieldAlert, UserRound } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { OptionCard } from "@/components/shared/option-card";

export default async function GuardHomePage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno) redirect("/guard/select-site");

  const roundDescription = estado.recorridoActivo ? "Recorrido en curso" : "Listo para el siguiente recorrido";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Hola, {guard.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{estado.sitio?.nombre ?? "Sitio no disponible"}</p>
      </div>

      <div className="flex flex-col gap-2">
        <OptionCard
          testId="option-scan"
          href="/guard/scan"
          icon={QrCode}
          title="Recorrido"
          description={roundDescription}
        />
        <OptionCard
          testId="option-completed-rounds"
          icon={ListChecks}
          title="Recorridos completados"
          description={`${estado.recorridosCompletados} en este turno`}
          badgeLabel={String(estado.recorridosCompletados)}
          badgeVariant="secondary"
        />
        <OptionCard
          testId="option-entry-log"
          href="/guard/logs/entry"
          icon={ClipboardList}
          title="Bitácora de ingreso"
          description="Registro de visitas y vehículos"
        />
        <OptionCard
          testId="option-incident-log"
          href="/guard/logs/incident"
          icon={ShieldAlert}
          title="Bitácora de incidencias"
          description="Reportar novedades del turno"
        />
        <OptionCard
          testId="option-profile"
          href="/guard/profile"
          icon={UserRound}
          title="Mi perfil"
          description="Datos de la cuenta"
        />
      </div>
    </div>
  );
}
