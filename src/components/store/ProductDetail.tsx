import Image from "next/image";
import { ImageIcon } from "@/components/icons";
import { InquiryForm } from "@/components/store/InquiryForm";
import { cn, type PublicProduct } from "@/lib/utils";

export function ProductImage({ product, sizes, priority, className }: { product: PublicProduct; sizes: string; priority?: boolean; className?: string }) {
  if (!product.image) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-muted/60">
        <ImageIcon width={36} height={36} strokeWidth={1.2} />
      </div>
    );
  }
  return <Image src={product.image} alt={product.title} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
}

export function AvailabilityBadge({ available, className }: { available: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        available ? "bg-sage-soft text-sage" : "bg-sand text-ink-soft",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", available ? "bg-sage" : "bg-muted")} />
      {available ? "Available" : "Currently unavailable"}
    </span>
  );
}

/** Full product view — rendered inside the storefront modal and on /products/[id]. */
export function ProductDetail({ product, variant = "modal" }: { product: PublicProduct; variant?: "modal" | "page" }) {
  const Heading = variant === "page" ? "h1" : "h2";

  return (
    <div className="grid md:grid-cols-2">
      <div
        className={cn(
          "relative aspect-square bg-sand md:sticky md:aspect-auto",
          // Fill the visible height: the dialog itself, or the viewport below the sticky header.
          variant === "modal" ? "md:top-0 md:h-[calc(100dvh-2rem)]" : "md:top-16 md:h-[min(860px,calc(100dvh-4rem))]",
        )}
      >
        <ProductImage product={product} sizes="(min-width: 768px) 520px, 100vw" priority />
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">{product.category}</p>
          <AvailabilityBadge available={product.available} />
        </div>

        <Heading className="display mt-4 text-[40px] sm:text-[52px]">{product.title}</Heading>
        {product.priceText && <p className="mt-4 text-lg tabular-nums text-ink">{product.priceText}</p>}

        {product.description && (
          <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
        )}

        {product.specs.length > 0 && (
          <section className="mt-9" aria-labelledby={`specs-${product.id}`}>
            <h3 id={`specs-${product.id}`} className="eyebrow mb-2">
              Specifications
            </h3>
            <dl className="divide-y divide-line border-y border-line">
              {product.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3 text-sm">
                  <dt className="text-muted">{s.label || "—"}</dt>
                  <dd className="text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section id={`inquire-${product.id}`} className="mt-10 rounded-2xl bg-sand/55 p-5 ring-1 ring-line sm:p-6">
          <h3 className="font-serif text-[26px] leading-tight tracking-[-0.01em]">Inquire about this piece</h3>
          <p className="mb-5 mt-1 text-sm text-muted">
            {product.available
              ? "Questions about sizing, lead times or trade pricing? We reply personally by email."
              : "This piece is currently unavailable — ask us about restocks or similar work."}
          </p>
          <InquiryForm productId={product.id} productTitle={product.title} />
        </section>
      </div>
    </div>
  );
}
