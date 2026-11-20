import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";

/** Constant-time comparison against ADMIN_PASSWORD. */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Use at the top of every admin page and Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/login");
}

function cookieIsSecure() {
  if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
  return process.env.NODE_ENV === "production";
}

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: cookieIsSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
