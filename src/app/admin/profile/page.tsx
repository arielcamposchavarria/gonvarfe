import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { ProfileCard } from "@/components/shared/profile-card";

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const admin = await container.findUserById(session.userId);
  if (!admin || admin.role !== "admin") redirect("/login");

  return <ProfileCard user={admin} />;
}
