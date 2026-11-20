"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

/** Only allow redirects to local admin paths. */
function safeNext(raw: FormDataEntryValue | null) {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "ADMIN_PASSWORD is not configured on the server." };
  }

  const key = `login:${await clientIp()}`;
  if (!rateLimit(key, 8, 15 * 60_000)) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return { error: "That password isn't right." };
  }

  resetRateLimit(key);
  await startSession();
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
