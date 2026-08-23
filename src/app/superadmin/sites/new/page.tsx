import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { CreateSiteForm } from "@/components/superadmin/create-site-form";

export default async function SuperAdminNewSitePage() {
  const session = await getSession();
  if (!session || session.role !== "superAdmin") redirect("/login");

  return <CreateSiteForm />;
}
