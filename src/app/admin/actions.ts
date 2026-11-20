"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import * as db from "@/lib/db";
import { UploadError, deleteImage, saveImage } from "@/lib/uploads";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"title" | "category" | "price_text" | "description" | "specs" | "image", string>>;
};

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;
  const existing = id ? db.getProduct(id) : undefined;
  if (id && !existing) return { error: "This product no longer exists." };

  const field = (k: string) => String(formData.get(k) ?? "").trim();
  const input = {
    title: field("title"),
    category: field("category").replace(/\s+/g, " "),
    price_text: field("price_text"),
    description: field("description"),
    specs: field("specs"),
    available: formData.get("available") === "on",
  };

  const fieldErrors: ProductFormState["fieldErrors"] = {};
  if (!input.title) fieldErrors.title = "Title is required.";
  else if (input.title.length > 120) fieldErrors.title = "Keep the title under 120 characters.";
  if (!input.category) fieldErrors.category = "Category is required.";
  else if (input.category.length > 40) fieldErrors.category = "Keep the category under 40 characters.";
  if (input.price_text.length > 60) fieldErrors.price_text = "Keep this under 60 characters.";
  if (input.description.length > 5000) fieldErrors.description = "Keep the description under 5,000 characters.";
  if (input.specs.length > 3000) fieldErrors.specs = "Keep specifications under 3,000 characters.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // ── Image handling ────────────────────────────────────────────
  let imagePath = existing?.image_path ?? null;
  const file = formData.get("image");
  const removeImage = formData.get("removeImage") === "on";

  if (file instanceof File && file.size > 0) {
    try {
      imagePath = await saveImage(file);
    } catch (err) {
      if (err instanceof UploadError) return { fieldErrors: { image: err.message } };
      throw err;
    }
  } else if (removeImage) {
    imagePath = null;
  }

  // ── Persist ───────────────────────────────────────────────────
  let savedId: number;
  if (existing) {
    db.updateProduct(existing.id, { ...input, image_path: imagePath });
    if (existing.image_path !== imagePath) await deleteImage(existing.image_path);
    savedId = existing.id;
  } else {
    savedId = db.createProduct({ ...input, image_path: imagePath });
  }

  refresh();
  redirect(`/admin?saved=${savedId}${existing ? "&mode=updated" : "&mode=created"}`);
}

export async function toggleAvailability(id: number, available: boolean) {
  await requireAdmin();
  db.setAvailability(id, available);
  refresh();
}

export async function removeProduct(id: number) {
  await requireAdmin();
  const product = db.getProduct(id);
  if (!product) return;
  db.deleteProduct(id);
  await deleteImage(product.image_path);
  refresh();
}
