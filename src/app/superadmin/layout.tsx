import { redirect } from "next/navigation";
import { Building2, Shield, UserRound, Users } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { AppShell, type NavItem } from "@/components/shared/app-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/superadmin/dashboard", label: "Usuarios", icon: Users },
  { href: "/superadmin/sites", label: "Sitios", icon: Building2 },
  { href: "/superadmin/guards", label: "Guardias", icon: Shield },
  { href: "/superadmin/profile", label: "Perfil", icon: UserRound },
];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "superAdmin") redirect("/login");

  const user = await container.findUserById(session.userId);
  if (!user || user.role !== "superAdmin" || !user.isActive) redirect("/login");

  return (
    <AppShell role="superAdmin" userName={user.name} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
