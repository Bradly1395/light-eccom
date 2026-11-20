"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { CloseIcon } from "@/components/icons";
import { ProductDetail, ProductImage } from "@/components/store/ProductDetail";
import { cn, type PublicProduct } from "@/lib/utils";

function setProductParam(id: number | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("product", String(id));
  else url.searchParams.delete("product");
  window.history.replaceState(window.history.state, "", url);
}

export function ProductGrid({ products, initialProductId }: { products: PublicProduct[]; initialProductId: number | null }) {
  const [activeId, setActiveId] = useState<number | null>(initialProductId);
  const active = products.find((p) => p.id === activeId) ?? null;
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (id: number) => {
    setActiveId(id);
    setProductParam(id);
  };
  const close = useCallback(() => {
    setActiveId(null);
    setProductParam(null);
  }, []);

  // Drive the native <dialog> (focus trap, Esc to close, top layer) from state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
      document.documentElement.style.overflow = "hidden";
    } else if (!active && dialog.open) {
      dialog.close();
    }
    if (!active) document.documentElement.style.overflow = "";
  }, [active]);

  const onCardClick = (e: MouseEvent<HTMLAnchorElement>, id: number) => {
    // Let cmd/ctrl/shift/middle-click open the standalone product page.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open(id);
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
            <a
              href={`/products/${p.id}`}
              id={`product-card-${p.id}`}
              onClick={(e) => onCardClick(e, p.id)}
              className="group block rounded-2xl outline-offset-4"
            >
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand shadow-soft ring-1 ring-line/70",
                  "transition-shadow duration-500 group-hover:shadow-lift",
                )}
              >
                <ProductImage
                  product={p}
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw"
                  priority={i < 4}
                  className={cn(
                    "transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]",
                    !p.available && "opacity-70 saturate-50",
                  )}
                />
                {!p.available && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-soft backdrop-blur">
                    Currently unavailable
                  </span>
                )}
                <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-white/90 py-2.5 text-center text-[13px] font-medium opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
                  View details
                </span>
              </div>
              <div className="mt-3.5 flex flex-col gap-1 px-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="eyebrow">{p.category}</p>
                  <h2 className="mt-1 text-[15px] font-medium leading-snug text-ink">{p.title}</h2>
                </div>
                {p.priceText && <p className="shrink-0 text-[14px] tabular-nums text-ink-soft sm:pt-[18px]">{p.priceText}</p>}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={active?.title ?? "Product details"}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close(); // backdrop click
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(1080px,calc(100%-1.5rem))] max-w-none overflow-y-auto rounded-3xl bg-paper p-0 text-ink shadow-lift open:animate-pop"
      >
        {active && (
          <div className="relative">
            <button
              type="button"
              id="product-modal-close"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:scale-105 hover:bg-white"
            >
              <CloseIcon width={18} height={18} />
            </button>
            <ProductDetail key={active.id} product={active} />
          </div>
        )}
      </dialog>
    </>
  );
}
