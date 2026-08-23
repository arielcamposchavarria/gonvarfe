import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { CreateGuardForm } from "@/components/admin/create-guard-form";

export default async function AdminNewGuardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const sites = await container.listSites();

  return <CreateGuardForm sites={sites.map((site) => ({ id: site.id, name: site.name }))} />;
}
