import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/* ────────────────────────────────────────────────────────────────
 * Local image storage in ./public/uploads.
 * The real file type is detected from its magic bytes — the browser-
 * supplied MIME type and file name are never trusted.
 * ──────────────────────────────────────────────────────────────── */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads/";

function detectImageType(buf: Buffer): "jpg" | "png" | "gif" | "webp" | "avif" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp" && /avi[fs]/.test(buf.subarray(8, 12).toString("ascii"))) return "avif";
  return null;
}

export class UploadError extends Error {}

/** Validates and writes an uploaded image. Returns its public URL path. */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Image must be 5 MB or smaller.");

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(buf);
  if (!ext) throw new UploadError("Unsupported image. Use JPG, PNG, WebP, GIF or AVIF.");

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return PUBLIC_PREFIX + name;
}

/** Deletes a previously uploaded image. Ignores anything outside /uploads (e.g. demo images). */
export async function deleteImage(publicPath: string | null | undefined) {
  if (!publicPath?.startsWith(PUBLIC_PREFIX)) return;
  const name = path.basename(publicPath);
  if (!/^[\w.-]+$/.test(name)) return;
  await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}
