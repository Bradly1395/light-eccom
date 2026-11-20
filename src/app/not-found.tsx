import Link from "next/link";
import { StoreFooter, StoreHeader } from "@/components/store/StoreChrome";

export default function NotFound() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 py-28 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">We couldn’t find that.</h1>
        <p className="mt-4 max-w-sm text-sm text-muted">The page or product may have been removed from the catalog.</p>
        <Link href="/" id="not-found-home" className="btn-primary mt-8">
          Browse the catalog
        </Link>
      </main>
      <StoreFooter />
    </>
  );
}
