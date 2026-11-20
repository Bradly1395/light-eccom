import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native Node addon — never bundle it.
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    serverActions: {
      // Product images are uploaded through a Server Action (max 5 MB per
      // image, enforced in src/lib/uploads.ts). Leave headroom for multipart
      // overhead and the other form fields.
      bodySizeLimit: "6mb",
    },
  },
  // `next start` only serves /public files that existed at build time.
  // Images uploaded afterwards fall through to a route handler that reads
  // them from ./public/uploads (see src/app/api/uploads/[file]/route.ts).
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/uploads/:file", destination: "/api/uploads/:file" }],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
