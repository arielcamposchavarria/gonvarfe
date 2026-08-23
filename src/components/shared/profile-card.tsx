import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROLE_LABELS } from "@/domain/value-objects/role";
import { isGuard, type AppUser } from "@/domain/entities/user";

export interface ProfileCardProps {
  user: AppUser;
  extra?: React.ReactNode;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileCard({ user, extra }: ProfileCardProps) {
  const photoUrl = isGuard(user) ? user.photoUrl : null;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          {isGuard(user) &&
            (photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto de referencia guardada como URL, no un asset del sitio
              <img
                src={photoUrl}
                alt="Foto de perfil"
                className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div
                aria-label="Foto de perfil no asignada"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-medium text-muted-foreground"
              >
                {initials(user.name)}
              </div>
            ))}
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.username}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge>{ROLE_LABELS[user.role]}</Badge>
          <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? "Activo" : "Inactivo"}</Badge>
        </div>
        {extra}
      </CardContent>
    </Card>
  );
}
