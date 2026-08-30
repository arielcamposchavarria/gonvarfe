import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { ProfileCard } from "@/components/shared/profile-card";

export default async function GuardProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const guard = await container.findUserById(session.userId);
  if (!guard || guard.role !== "guard") redirect("/login");

  const estado = await container.obtenerEstadoTurno();

  return (
    <ProfileCard
      user={guard}
      extra={estado.sitio && <p className="text-sm text-muted-foreground">Sitio actual: {estado.sitio.nombre}</p>}
    />
  );
}
