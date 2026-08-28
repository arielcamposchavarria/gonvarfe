import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, parseSessionCookie, type SessionPayload } from "./session-cookie";

/** Debe coincidir con JWT_EXPIRES_IN configurado en el backend (gonvarbe). */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function createSession(accessToken: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, accessToken, {
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

/** Token crudo para reenviar como `Authorization: Bearer` al backend real. */
export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}
