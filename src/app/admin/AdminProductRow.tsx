"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { ImageIcon, PencilIcon, TrashIcon } from "@/components/icons";
import type { Product } from "@/lib/db";
import { cn } from "@/lib/utils";
import { removeProduct, toggleAvailability } from "./actions";

export function AdminProductRow({ product, isEditing }: { product: Product; isEditing: boolean }) {
  const [available, setOptimisticAvailable] = useOptimistic(product.available === 1);
  const [, startToggle] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    const next = !available;
    setError(null);
    startToggle(async () => {
      setOptimisticAvailable(next);
      try {
        await toggleAvailability(product.id, next);
      } catch {
        setError("Couldn't update availability.");
      }
    });
  };

  const del = () => {
    if (!confirm(`Delete “${product.title}”? This can't be undone.`)) return;
    setError(null);
    setHidden(true); // remove from the list instantly
    startDelete(async () => {
      try {
        await removeProduct(product.id);
      } catch {
        setHidden(false);
        setError("Couldn't delete this product.");
      }
    });
  };

  if (hidden && !error) return null;

  return (
    <li
      className={cn(
        "flex animate-fade-up items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 transition sm:gap-4 sm:p-3.5",
        isEditing ? "ring-ink/70" : "ring-line",
        deleting && "opacity-50",
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-16">
        {product.image_path ? (
          <Image
            src={product.image_path}
            alt=""
            fill
            sizes="64px"
            className={cn("object-cover transition", !available && "opacity-60 saturate-50")}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted/60">
            <ImageIcon width={20} height={20} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-medium", !available && "text-ink-soft")}>{product.title}</p>
        <p className="mt-0.5 truncate text-[13px] text-muted">
          {product.category}
          {product.price_text && <> · {product.price_text}</>}
        </p>
        {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
      </div>

      <button
        type="button"
        role="switch"
        id={`toggle-available-${product.id}`}
        aria-checked={available}
        aria-label={`${product.title} available`}
        onClick={toggle}
        className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-1 sm:pl-3"
      >
        <span className={cn("hidden w-[74px] text-right text-xs font-medium sm:block", available ? "text-sage" : "text-muted")}>
          {available ? "Available" : "Unavailable"}
        </span>
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors duration-200",
            available ? "bg-sage" : "bg-sand-deep",
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ease-out",
              available && "translate-x-5",
            )}
          />
        </span>
      </button>

      <div className="flex shrink-0 items-center">
        <Link
          href={`/admin?edit=${product.id}#product-form`}
          id={`edit-product-${product.id}`}
          aria-label={`Edit ${product.title}`}
          className="btn-ghost size-9 px-0"
        >
          <PencilIcon width={17} height={17} />
        </Link>
        <button
          type="button"
          id={`delete-product-${product.id}`}
          onClick={del}
          disabled={deleting}
          aria-label={`Delete ${product.title}`}
          className="btn-ghost size-9 px-0 hover:bg-danger-soft hover:text-danger"
        >
          <TrashIcon width={17} height={17} />
        </button>
      </div>
    </li>
  );
}
