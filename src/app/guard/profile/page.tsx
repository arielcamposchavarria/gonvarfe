import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { ProfileCard } from "@/components/shared/profile-card";

export default async function GuardProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const site = await container.listSites().then((sites) => sites.find((s) => s.id === guard.assignedSiteId));

  return (
    <ProfileCard
      user={guard}
      extra={site && <p className="text-sm text-muted-foreground">Sitio asignado: {site.name}</p>}
    />
  );
}
