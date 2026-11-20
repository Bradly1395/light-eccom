import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { isAdmin } from "@/lib/auth";
import { siteName } from "@/lib/utils";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await isAdmin()) redirect("/admin");
  const next = (await searchParams).next;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" id="login-brand" className="mb-10 block text-center font-serif text-3xl tracking-[-0.01em]">
          {siteName()}
        </Link>

        <div className="surface p-7 sm:p-8">
          <h1 className="display text-[38px]">Admin sign in</h1>
          <p className="mb-7 mt-2 text-sm text-muted">Enter the admin password to manage the catalog.</p>
          <LoginForm next={typeof next === "string" ? next : "/admin"} />
        </div>

        <Link href="/" id="login-back" className="btn-ghost btn-sm mx-auto mt-6 flex w-fit">
          <ArrowLeftIcon width={16} height={16} /> Back to store
        </Link>
      </div>
    </main>
  );
}
