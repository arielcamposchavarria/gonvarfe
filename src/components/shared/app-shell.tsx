import Image from "next/image";
import Link from "next/link";
import { LogOut, type LucideIcon } from "lucide-react";

import { ROLE_LABELS, type Role } from "@/domain/value-objects/role";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AppShellProps {
  role: Role;
  userName: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function AppShell({ role, userName, navItems, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Image src="/gonvar-shield.png" alt="" width={28} height={28} className="shrink-0 rounded-md" priority />
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="text-sm font-bold tracking-tight text-foreground">GonVar</span>
              <span className="truncate text-xs text-muted-foreground">{ROLE_LABELS[role]}</span>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">{userName}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="icon" className="sm:hidden" aria-label="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button type="submit" variant="outline" size="sm" className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-4 pb-20 sm:pb-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-4xl items-stretch">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground active:text-accent"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
