"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CloseIcon, Spinner, UploadIcon } from "@/components/icons";
import type { Product } from "@/lib/db";
import { saveProduct, type ProductFormState } from "./actions";

const MAX_BYTES = 5 * 1024 * 1024;

export function ProductForm({ product, categories }: { product?: Product; categories: string[] }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(product?.image_path ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [clientImageError, setClientImageError] = useState<string | null>(null);
  const fe = state.fieldErrors ?? {};
  const imageError = clientImageError ?? fe.image;

  // Revoke blob: URLs when they're replaced.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFile = (file: File | undefined) => {
    setClientImageError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setClientImageError("Please choose an image file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setClientImageError("Image must be 5 MB or smaller.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setRemoveImage(false);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (fileRef.current) fileRef.current.value = "";
    setPreview(null);
    setClientImageError(null);
    if (product?.image_path) setRemoveImage(true);
  };

  return (
    <form
      action={formAction}
      // Submit manually so React doesn't reset the form (and the chosen file) on validation errors.
      onSubmit={(e) => {
        e.preventDefault();
        if (clientImageError) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="product-form-title" className="font-serif text-[28px] leading-tight tracking-[-0.01em]">
            {product ? "Edit product" : "Add a product"}
          </h2>
          {product && <p className="mt-0.5 truncate text-sm text-muted">Editing “{product.title}”</p>}
        </div>
        {product && (
          <Link href="/admin" id="cancel-edit" aria-label="Cancel editing" className="btn-ghost size-9 shrink-0 px-0">
            <CloseIcon width={17} height={17} />
          </Link>
        )}
      </div>

      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="removeImage" value={removeImage ? "on" : ""} />

      {/* Image */}
      <div>
        <span className="field-label">Image</span>
        <div className="group relative">
          <label
            htmlFor="product-image"
            className="relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl bg-sand/60 text-center ring-1 ring-line transition hover:bg-sand hover:ring-sand-deep"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob: previews can't go through next/image
              <img src={preview} alt="Selected product image" className="absolute inset-0 size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 px-6 text-sm text-ink-soft">
                <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft">
                  <UploadIcon width={18} height={18} />
                </span>
                <span className="font-medium">Click to upload</span>
                <span className="text-xs text-muted">JPG, PNG, WebP, GIF or AVIF · up to 5 MB</span>
              </span>
            )}
            {preview && (
              <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 py-2 text-center text-xs font-medium opacity-0 shadow-soft backdrop-blur transition group-hover:opacity-100">
                Replace image
              </span>
            )}
          </label>
          {preview && (
            <button
              type="button"
              id="remove-image"
              onClick={clearImage}
              aria-label="Remove image"
              className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:bg-white"
            >
              <CloseIcon width={15} height={15} />
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          id="product-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="sr-only"
        />
        {imageError && <p className="field-error">{imageError}</p>}
      </div>

      <Field label="Title" name="title" error={fe.title}>
        <input
          id="product-title"
          name="title"
          required
          maxLength={120}
          defaultValue={product?.title}
          placeholder="e.g. Oak & Cord Lounge Chair"
          aria-invalid={!!fe.title}
          className="input"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Category" name="category" error={fe.category}>
          <input
            id="product-category"
            name="category"
            required
            maxLength={40}
            list="category-options"
            defaultValue={product?.category}
            placeholder="e.g. Furniture"
            aria-invalid={!!fe.category}
            className="input"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Price / quote" name="price_text" error={fe.price_text}>
          <input
            id="product-price_text"
            name="price_text"
            maxLength={60}
            defaultValue={product?.price_text}
            placeholder="$240 or Request a quote"
            aria-invalid={!!fe.price_text}
            className="input"
          />
        </Field>
      </div>

      <Field label="Description" name="description" error={fe.description}>
        <textarea
          id="product-description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={product?.description}
          placeholder="Materials, story, how it's made…"
          aria-invalid={!!fe.description}
          className="input resize-y"
        />
      </Field>

      <Field label="Specifications" name="specs" error={fe.specs} hint="One per line, as Label: Value">
        <textarea
          id="product-specs"
          name="specs"
          rows={4}
          maxLength={3000}
          defaultValue={product?.specs}
          placeholder={"Material: White oak\nDimensions: W 71 × D 74 × H 72 cm"}
          aria-invalid={!!fe.specs}
          className="input resize-y font-mono text-[13px] leading-relaxed"
        />
      </Field>

      <label htmlFor="product-available" className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-sand/50 px-4 py-3 ring-1 ring-line">
        <span>
          <span className="block text-sm font-medium">Available</span>
          <span className="block text-xs text-muted">Unavailable items stay listed with a badge.</span>
        </span>
        <input
          id="product-available"
          name="available"
          type="checkbox"
          defaultChecked={product ? product.available === 1 : true}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 shrink-0 rounded-full bg-sand-deep transition-colors peer-checked:bg-sage peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" id="product-submit" disabled={pending} className="btn-primary flex-1">
          {pending ? (
            <>
              <Spinner /> Saving…
            </>
          ) : product ? (
            "Save changes"
          ) : (
            "Add product"
          )}
        </button>
        {product && (
          <Link href="/admin" id="cancel-edit-secondary" className="btn-secondary">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}

function Field({ label, name, error, hint, children }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`product-${name}`} className="field-label">
        {label}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
