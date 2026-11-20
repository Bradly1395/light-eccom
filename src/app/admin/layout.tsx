import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon, LogoutIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { siteName } from "@/lib/utils";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" id="admin-brand" className="font-serif text-[24px] leading-none tracking-[-0.01em]">
              {siteName()}
            </Link>
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-paper">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" id="admin-view-store" target="_blank" className="btn-ghost btn-sm">
              View store <ArrowUpRightIcon width={15} height={15} />
            </Link>
            <form action={logout}>
              <button type="submit" id="admin-logout" className="btn-ghost btn-sm">
                <LogoutIcon width={16} height={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
