import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROLE_LABELS } from "@/domain/value-objects/role";
import type { AppUser } from "@/domain/entities/user";
import { UserAvatar } from "./user-avatar";

export interface ProfileCardProps {
  user: AppUser;
  extra?: React.ReactNode;
}

export function ProfileCard({ user, extra }: ProfileCardProps) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} photoUrl={user.photoUrl} />
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
        {user.email && <p className="text-sm text-muted-foreground">Correo: {user.email}</p>}
        {extra}
      </CardContent>
    </Card>
  );
}
