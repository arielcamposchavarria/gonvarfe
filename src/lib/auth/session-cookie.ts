import { isRole, type Role } from "@/domain/value-objects/role";

/**
 * Sin dependencias de `next/headers` para poder usarse también en
 * middleware.ts (Edge runtime).
 */
export const SESSION_COOKIE_NAME = "gonvar_session";

export interface SessionPayload {
  userId: string;
  role: Role;
}

export function serializeSession(payload: SessionPayload): string {
  return JSON.stringify(payload);
}

export function parseSessionCookie(raw: string | undefined | null): SessionPayload | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { userId?: unknown; role?: unknown };
    if (typeof data.userId === "string" && typeof data.role === "string" && isRole(data.role)) {
      return { userId: data.userId, role: data.role };
    }
    return null;
  } catch {
    return null;
  }
}
