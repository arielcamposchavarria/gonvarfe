import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ROLE_PATH_SEGMENT } from "@/domain/value-objects/role";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(`/${ROLE_PATH_SEGMENT[session.role]}/dashboard`);
}
