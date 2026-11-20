/* Shared, client-safe helpers. */

export type PublicProduct = {
  id: number;
  title: string;
  category: string;
  priceText: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string | null;
  available: boolean;
};

/** Parse "Label: Value" lines into pairs. Lines without a colon become value-only rows. */
export function parseSpecs(raw: string): { label: string; value: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i > 0 ? { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : { label: "", value: line };
    });
}

export function toPublicProduct(p: {
  id: number;
  title: string;
  category: string;
  price_text: string;
  description: string;
  specs: string;
  image_path: string | null;
  available: number;
}): PublicProduct {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    priceText: p.price_text,
    description: p.description,
    specs: parseSpecs(p.specs),
    image: p.image_path,
    available: p.available === 1,
  };
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const siteName = () => process.env.SITE_NAME || "Fieldhouse Goods";
