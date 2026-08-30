import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { CreateSiteForm } from "@/components/shared/create-site-form";
import { createSiteAction } from "@/app/superadmin/sites/actions";

export default async function SuperAdminNewSitePage() {
  const session = await getSession();
  if (!session || session.role !== "superAdmin") redirect("/login");

  return <CreateSiteForm action={createSiteAction} backHref="/superadmin/sites" />;
}
