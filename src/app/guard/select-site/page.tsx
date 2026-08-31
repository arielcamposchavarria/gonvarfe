import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { SelectSiteForm } from "@/components/guard/select-site-form";

export default async function GuardSelectSitePage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (estado.turno) redirect("/guard/dashboard");

  const sitios = await container.listSitiosParaGuardia();
  // Un solo sitio vigente por guardia: si el superAdmin le asignó uno, no
  // elige entre todos los sitios activos, solo ve el suyo.
  const visibleSitios = guard.assignedSiteId
    ? sitios.filter((sitio) => sitio.id === guard.assignedSiteId)
    : sitios;

  return <SelectSiteForm sitios={visibleSitios} />;
}
