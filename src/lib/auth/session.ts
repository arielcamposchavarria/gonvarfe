import { cookies } from "next/headers";
import type { AppUser } from "@/domain/entities/user";
import { SESSION_COOKIE_NAME, serializeSession, parseSessionCookie, type SessionPayload } from "./session-cookie";

/** Duración de la sesión mock: 12 horas, suficiente para cubrir un turno. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function createSession(user: AppUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, serializeSession({ userId: user.id, role: user.role }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return parseSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
}
