import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { ProductDetail } from "@/components/store/ProductDetail";
import { StoreFooter, StoreHeader } from "@/components/store/StoreChrome";
import { getProduct } from "@/lib/db";
import { toPublicProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

function load(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? getProduct(n) : undefined;
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const product = load((await params).id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 160) || `${product.title} — ${product.category}`,
    openGraph: product.image_path ? { images: [product.image_path] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const product = load((await params).id);
  if (!product) notFound();

  return (
    <>
      <StoreHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <Link href="/" id="back-to-catalog" className="btn-ghost btn-sm -ml-3 mb-6">
          <ArrowLeftIcon width={16} height={16} /> Back to catalog
        </Link>
        <article className="animate-fade-up overflow-clip rounded-3xl bg-white/70 shadow-soft ring-1 ring-line">
          <ProductDetail product={toPublicProduct(product)} variant="page" />
        </article>
      </main>
      <StoreFooter />
    </>
  );
}
