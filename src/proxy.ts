import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, parseSessionCookie } from "@/lib/auth/session-cookie";
import { ROLE_PATH_SEGMENT, type Role } from "@/domain/value-objects/role";

const ROLE_BY_SEGMENT: Record<string, Role> = Object.fromEntries(
  (Object.entries(ROLE_PATH_SEGMENT) as [Role, string][]).map(([role, segment]) => [segment, role]),
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];
  const requiredRole = ROLE_BY_SEGMENT[segment];
  if (!requiredRole) return NextResponse.next();

  const session = await parseSessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session || session.role !== requiredRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/guard/:path*", "/admin/:path*", "/superadmin/:path*"],
};
