import Link from "next/link";
import { siteName } from "@/lib/utils";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" id="brand-home" className="font-serif text-[26px] leading-none tracking-[-0.01em]">
          {siteName()}
        </Link>
        <p className="hidden text-[13px] text-muted sm:block">Small-batch goods · Personal replies within one business day</p>
      </div>
    </header>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {siteName()}
        </p>
        <Link href="/admin" id="footer-admin-link" className="transition-colors hover:text-ink">
          Admin
        </Link>
      </div>
    </footer>
  );
}
