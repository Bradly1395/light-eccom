import { SignJWT, jwtVerify } from "jose";

/* ────────────────────────────────────────────────────────────────
 * Stateless admin session: an HS256-signed JWT stored in an
 * HTTP-only cookie. This file has no Next.js server imports so it
 * can be used from both src/proxy.ts and Server Components/Actions.
 * ──────────────────────────────────────────────────────────────── */

export const SESSION_COOKIE = "catalog_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

let cachedKey: { source: string; key: Uint8Array } | null = null;

/** Derive a fixed-length 256-bit HMAC key from SESSION_SECRET (or ADMIN_PASSWORD). */
async function getKey(): Promise<Uint8Array> {
  const source = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!source) throw new Error("Set SESSION_SECRET or ADMIN_PASSWORD to enable admin sessions.");
  if (cachedKey?.source === source) return cachedKey.key;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`catalog-session:v1:${source}`));
  cachedKey = { source, key: new Uint8Array(digest) };
  return cachedKey.key;
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(await getKey());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, await getKey(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
