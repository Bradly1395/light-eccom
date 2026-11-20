import Link from "next/link";
import { cn } from "@/lib/utils";

export function catalogHref(category: string, q: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const s = params.toString();
  return s ? `/?${s}` : "/";
}

export function CategoryTabs({
  categories,
  active,
  q,
  total,
}: {
  categories: { category: string; count: number }[];
  active: string;
  q: string;
  total: number;
}) {
  const tabs = [{ label: "All", value: "", count: total }, ...categories.map((c) => ({ label: c.category, value: c.category, count: c.count }))];

  return (
    <nav aria-label="Product categories" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {tabs.map((t) => {
        const isActive = t.value.toLowerCase() === active.toLowerCase();
        return (
          <Link
            key={t.label}
            id={`category-tab-${t.value ? t.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "all"}`}
            href={catalogHref(t.value, q)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors duration-200",
              isActive ? "bg-ink text-paper shadow-soft" : "text-ink-soft hover:bg-sand hover:text-ink",
            )}
          >
            {t.label}
            <span className={cn("tabular-nums text-[11px]", isActive ? "text-paper/60" : "text-muted")}>{t.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
