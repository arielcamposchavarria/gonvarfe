import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { SelectSiteForm } from "@/components/guard/select-site-form";
import { NoSiteAssignedMessage } from "@/components/guard/no-site-assigned-message";

export default async function GuardSelectSitePage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (estado.turno) redirect("/guard/dashboard");

  // El guardia nunca elige su sitio: solo el admin lo asigna. Si no tiene
  // ninguno (o el asignado ya no está disponible), se le pide contactar al
  // administrador en vez de mostrarle una lista para escoger.
  if (!guard.assignedSiteId) {
    return <NoSiteAssignedMessage />;
  }

  const sitios = await container.listSitiosParaGuardia();
  const sitio = sitios.find((s) => s.id === guard.assignedSiteId);
  if (!sitio) {
    return <NoSiteAssignedMessage variant="unavailable" />;
  }

  return <SelectSiteForm sitio={sitio} />;
}
