import Link from "next/link";
import { CategoryTabs, catalogHref } from "@/components/store/CategoryTabs";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchBar } from "@/components/store/SearchBar";
import { StoreFooter, StoreHeader } from "@/components/store/StoreChrome";
import { listCategories, listProducts } from "@/lib/db";
import { toPublicProduct } from "@/lib/utils";

// Always read fresh data from SQLite.
export const dynamic = "force-dynamic";

const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function CatalogPage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = param(sp.q).trim().slice(0, 100);
  const categories = listCategories({ includeUnavailable: true });
  // Only honour categories that exist (case-insensitive), keeping their canonical casing.
  const category = categories.find((c) => c.category.toLowerCase() === param(sp.category).toLowerCase())?.category ?? "";
  const productParam = Number(param(sp.product));

  const products = listProducts({ category, q, includeUnavailable: true, availableFirst: true }).map(toPublicProduct);
  const total = categories.reduce((n, c) => n + c.count, 0);
  const initialProductId = products.some((p) => p.id === productParam) ? productParam : null;

  return (
    <>
      <StoreHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 sm:px-8">
        <section className="grid items-end gap-6 pb-10 pt-14 sm:pb-14 sm:pt-20 md:grid-cols-[1.5fr_1fr]">
          <div className="animate-fade-up">
            <p className="eyebrow">The catalog · {total} pieces</p>
            <h1 className="display mt-4 max-w-[13ch] text-[52px] sm:text-[76px]">Objects made to be lived with.</h1>
          </div>
          <p className="max-w-sm animate-fade-up text-[15px] leading-relaxed text-ink-soft [animation-delay:80ms] md:justify-self-end">
            Furniture, lighting and everyday goods, made in small batches. See something you like? Send us a note from
            any product — we answer every inquiry personally.
          </p>
        </section>

        <div className="sticky top-16 z-20 -mx-5 mb-8 flex flex-col-reverse gap-3 border-b border-line/80 bg-paper/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <CategoryTabs categories={categories} active={category} q={q} total={total} />
          <SearchBar q={q} category={category} />
        </div>

        {(q || category) && products.length > 0 && (
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {products.length} {products.length === 1 ? "result" : "results"}
            {q && (
              <>
                {" "}
                for <span className="text-ink">“{q}”</span>
              </>
            )}
            {category && (
              <>
                {" "}
                in <span className="text-ink">{category}</span>
              </>
            )}
          </p>
        )}

        {products.length > 0 ? (
          <ProductGrid key={`${category}|${q}`} products={products} initialProductId={initialProductId} />
        ) : (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="display text-4xl">{q || category ? "Nothing matches that." : "The shelves are empty."}</p>
            <p className="mt-3 max-w-sm text-sm text-muted">
              {q || category
                ? "Try a different word, or browse everything in the catalog."
                : "New pieces are on their way. Check back soon."}
            </p>
            {(q || category) && (
              <Link href={catalogHref("", "")} id="clear-filters" className="btn-secondary mt-6">
                View all products
              </Link>
            )}
          </div>
        )}
      </main>

      <StoreFooter />
    </>
  );
}
