import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/* Optimistic gate for /admin: bounce to /login when the session cookie
 * is missing or invalid. Every admin page and Server Action ALSO calls
 * requireAdmin(), so this is a UX layer, not the only line of defence. */
export async function proxy(request: NextRequest) {
  const ok = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
