import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { EntryLogForm } from "@/components/guard/entry-log-form";
import { OpenEntryLogs } from "@/components/guard/open-entry-logs";

export default async function GuardEntryLogPage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno || !estado.sitio) redirect("/guard/select-site");

  const logs = await container.listMyEntryLogs(guard.id);
  const openLogs = logs.filter((log) => log.exitTime === null);

  return (
    <div className="flex flex-col gap-4">
      <OpenEntryLogs logs={openLogs} />
      <EntryLogForm visitingLocals={estado.sitio.locales.map((local) => local.nombre)} />
    </div>
  );
}
