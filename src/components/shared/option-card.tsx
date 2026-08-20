import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface OptionCardProps {
  href?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badgeLabel?: string;
  badgeVariant?: "success" | "secondary";
  muted?: boolean;
  testId?: string;
}

export function OptionCard({
  href,
  icon: Icon,
  title,
  description,
  badgeLabel,
  badgeVariant = "success",
  muted,
  testId,
}: OptionCardProps) {
  const content = (
    <div
      data-testid={testId}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors",
        href && "hover:bg-surface-hover active:bg-surface-hover",
        muted && "opacity-60",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          {badgeLabel && (
            <Badge variant={badgeVariant} className="shrink-0">
              {badgeLabel}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {href && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
