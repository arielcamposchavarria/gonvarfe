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

  return <SelectSiteForm sitios={sitios} />;
}
