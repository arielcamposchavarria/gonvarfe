import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { ProfileCard } from "@/components/shared/profile-card";

export default async function SuperAdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "superAdmin") redirect("/login");

  const superAdmin = await container.findUserById(session.userId);
  if (!superAdmin || superAdmin.role !== "superAdmin") redirect("/login");

  return <ProfileCard user={superAdmin} />;
}
