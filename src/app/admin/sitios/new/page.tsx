import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { CreateSiteForm } from "@/components/shared/create-site-form";
import { createSiteAction } from "@/app/admin/sitios/actions";

export default async function AdminNewSitioPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return <CreateSiteForm action={createSiteAction} backHref="/admin/sitios" />;
}
