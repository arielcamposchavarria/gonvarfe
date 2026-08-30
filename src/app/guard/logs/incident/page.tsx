import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { IncidentLogForm } from "@/components/guard/incident-log-form";

export default async function GuardIncidentLogPage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno) redirect("/guard/select-site");

  return <IncidentLogForm />;
}
