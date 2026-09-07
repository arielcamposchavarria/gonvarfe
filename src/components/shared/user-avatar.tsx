export interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md";
}

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-14 w-14 text-sm",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Foto de perfil si existe; si no, iniciales del nombre. Usado en la tarjeta de perfil y en el encabezado. */
export function UserAvatar({ name, photoUrl, size = "md" }: UserAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto de perfil guardada como data URL, no un asset del sitio
      <img
        src={photoUrl}
        alt="Foto de perfil"
        className={`${sizeClass} shrink-0 rounded-full border border-border object-cover`}
      />
    );
  }

  return (
    <div
      aria-label="Foto de perfil no asignada"
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-muted-foreground`}
    >
      {initials(name)}
    </div>
  );
}
