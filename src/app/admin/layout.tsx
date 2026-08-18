import { redirect } from "next/navigation";
import { Building2, ShieldCheck, UserRound } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { AppShell, type NavItem } from "@/components/shared/app-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Sitios", icon: Building2 },
  { href: "/admin/guards", label: "Guardas", icon: ShieldCheck },
  { href: "/admin/profile", label: "Perfil", icon: UserRound },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const user = await container.findUserById(session.userId);
  if (!user || user.role !== "admin" || !user.isActive) redirect("/login");

  return (
    <AppShell role="admin" userName={user.name} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
