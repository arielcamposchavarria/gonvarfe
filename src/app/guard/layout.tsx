import { redirect } from "next/navigation";
import { LayoutDashboard, QrCode, UserRound } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { AppShell, type NavItem } from "@/components/shared/app-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/guard/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/guard/scan", label: "Recorrido", icon: QrCode },
  { href: "/guard/profile", label: "Perfil", icon: UserRound },
];

export default async function GuardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "guard") redirect("/login");

  const user = await container.findUserById(session.userId);
  if (!user || user.role !== "guard" || !user.isActive) redirect("/login");

  return (
    <AppShell role="guard" userName={user.name} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
