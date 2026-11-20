"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CloseIcon, SearchIcon, Spinner } from "@/components/icons";

function buildHref(category: string, q: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/?${s}` : "/";
}

export function SearchBar({ q, category }: { q: string; category: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(q);
  const [pending, startTransition] = useTransition();

  // Keep in sync when the URL changes from elsewhere (e.g. "Clear search"),
  // but never overwrite what the user is actively typing.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(q);
  }, [q]);

  const go = (next: string) => startTransition(() => router.replace(buildHref(category, next.trim()), { scroll: false }));

  // Debounced live search.
  useEffect(() => {
    if (value.trim() === q) return;
    const t = setTimeout(() => go(value), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      action="/"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
      className="relative w-full sm:w-72"
    >
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="catalog-search" className="sr-only">
        Search products
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
        {pending ? <Spinner /> : <SearchIcon width={17} height={17} />}
      </span>
      <input
        ref={inputRef}
        id="catalog-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search the catalog"
        autoComplete="off"
        maxLength={100}
        className="input h-10 rounded-full pl-10 pr-9 text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          id="catalog-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            go("");
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-1.5 my-auto flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink"
        >
          <CloseIcon width={15} height={15} />
        </button>
      )}
    </form>
  );
}
