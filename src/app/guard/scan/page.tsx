import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { RoundScanBoard } from "@/components/guard/round-scan-board";

export default async function GuardScanPage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno || !estado.sitio) redirect("/guard/select-site");

  return (
    <RoundScanBoard
      sitio={estado.sitio}
      recorridoActivo={estado.recorridoActivo}
      recorridosCompletados={estado.recorridosCompletados}
    />
  );
}
