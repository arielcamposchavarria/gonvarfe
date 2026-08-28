import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { EntryLogForm } from "@/components/guard/entry-log-form";

export default async function GuardEntryLogPage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno || !estado.sitio) redirect("/guard/select-site");

  return <EntryLogForm visitingLocals={estado.sitio.locales.map((local) => local.nombre)} />;
}
