import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { CreateGuardForm } from "@/components/admin/create-guard-form";

export default async function AdminNewGuardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return <CreateGuardForm />;
}
