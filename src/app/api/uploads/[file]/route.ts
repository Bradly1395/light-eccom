import fs from "node:fs/promises";
import path from "node:path";

/* ────────────────────────────────────────────────────────────────
 * Serves images from ./public/uploads.
 *
 * `next start` only serves files that existed in /public at build time,
 * so images uploaded later would 404. next.config.ts adds a *fallback*
 * rewrite /uploads/:file → /api/uploads/:file, which only kicks in when
 * the static file isn't found — URLs stay /uploads/… everywhere.
 * ──────────────────────────────────────────────────────────────── */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[file]">) {
  const { file } = await ctx.params;
  const type = TYPES[path.extname(file).toLowerCase()];

  // Only plain generated file names — no path traversal.
  if (!type || !/^[\w.-]+$/.test(file) || file.startsWith(".")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(data.byteLength),
        // File names are unique per upload, so they can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
