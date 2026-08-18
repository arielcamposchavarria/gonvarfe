import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { RoundScanBoard } from "@/components/guard/round-scan-board";

export default async function GuardDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const status = await container.getShiftStatus(guard.assignedSiteId, guard.id);

  return (
    <RoundScanBoard
      site={status.site}
      session={status.session}
      activeRound={status.activeRound}
      completedRoundsCount={status.completedRoundsCount}
    />
  );
}
