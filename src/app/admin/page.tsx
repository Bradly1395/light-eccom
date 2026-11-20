import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { countProducts, getProduct, listCategories, listProducts } from "@/lib/db";
import { AdminProductRow } from "./AdminProductRow";
import { ProductForm } from "./ProductForm";
import { SavedNotice } from "./SavedNotice";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin(); // layouts don't re-run on every navigation — guard the page too

  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? Number(sp.edit) : NaN;
  const editing = Number.isInteger(editId) ? getProduct(editId) : undefined;
  const savedId = typeof sp.saved === "string" ? Number(sp.saved) : NaN;
  const saved = Number.isInteger(savedId) ? getProduct(savedId) : undefined;

  const products = listProducts({ includeUnavailable: true });
  const categories = listCategories({ includeUnavailable: true }).map((c) => c.category);
  const counts = countProducts();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[44px]">Products</h1>
          <p className="mt-2 text-sm text-muted">
            {counts.total} {counts.total === 1 ? "product" : "products"} · {counts.available} available
          </p>
        </div>
        {editing && (
          <Link href="/admin" id="admin-new-product" className="btn-primary btn-sm">
            <PlusIcon width={16} height={16} /> New product
          </Link>
        )}
      </div>

      {saved && <SavedNotice key={`${saved.id}-${String(sp.mode)}`} title={saved.title} mode={sp.mode === "updated" ? "updated" : "created"} />}

      <div className="grid items-start gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section id="product-form" aria-labelledby="product-form-title" className="surface scroll-mt-24 p-6 sm:p-7">
          <ProductForm key={editing?.id ?? "new"} product={editing} categories={categories} />
        </section>

        <section aria-label="Existing products">
          {products.length ? (
            <ul className="space-y-2.5">
              {products.map((p) => (
                <AdminProductRow key={p.id} product={p} isEditing={p.id === editing?.id} />
              ))}
            </ul>
          ) : (
            <div className="surface flex flex-col items-center px-6 py-20 text-center">
              <p className="display text-3xl">No products yet</p>
              <p className="mt-2 text-sm text-muted">Add your first product with the form.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
