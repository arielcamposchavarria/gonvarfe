import { jwtVerify } from "jose";
import { isRole, type Role } from "@/domain/value-objects/role";

/**
 * Sin dependencias de `next/headers` para poder usarse también en
 * proxy.ts (Edge runtime).
 */
export const SESSION_COOKIE_NAME = "gonvar_session";

export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: Role;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Falta configurar JWT_SECRET.");
  return new TextEncoder().encode(secret);
}

/**
 * La cookie guarda el JWT tal cual lo emite el backend (gonvarbe): se
 * verifica su firma localmente para no depender de un round-trip por
 * cada request protegido.
 */
export async function parseSessionCookie(raw: string | undefined | null): Promise<SessionPayload | null> {
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, getSecretKey());
    const { sub, username, name, role } = payload;
    if (
      typeof sub === "string" &&
      typeof username === "string" &&
      typeof name === "string" &&
      typeof role === "string" &&
      isRole(role)
    ) {
      return { userId: sub, username, name, role };
    }
    return null;
  } catch {
    return null;
  }
}
