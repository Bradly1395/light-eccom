# Self-hosted product catalog

A lightweight product catalog with a built-in admin dashboard. No cloud database, no paid APIs. Everything runs in a single Next.js process on your own server.

- **Next.js 16 (App Router)**, TypeScript, Tailwind CSS v4
- **SQLite** via `better-sqlite3` at `./data/catalog.db`. Tables are created automatically on startup.
- **Local image uploads** to `./public/uploads` through Server Actions
- **Single-admin auth**: `ADMIN_PASSWORD`, plus a signed HTTP-only session cookie (jose, HS256)
- **Email inquiries** sent with Nodemailer over any SMTP server, with `replyTo` set to the customer

## Quick start

```bash
npm install
npm install-scripts approve better-sqlite3   # npm ≥ 11 only: allow the native build
cp .env.example .env.local                    # then edit the values
npm run dev                                   # http://localhost:3000
```

- Storefront: `/`
- Admin: `/admin`. It redirects to `/login`. Sign in with `ADMIN_PASSWORD`.

The first time the database is created, six demo products are added. Set `SEED_DEMO_DATA="false"` to start empty, or delete them from the admin.

> If SMTP isn't configured in development, inquiries are printed to the server console so you can still test the flow.

## Production

```bash
npm run build
npm start          # PORT=8080 npm start to change the port
```

- Persist and back up `./data/` (database) and `./public/uploads/` (images).
- Session cookies are `Secure` in production. If you serve over plain HTTP, set `COOKIE_SECURE="false"`.
- `next start` only serves `/public` files that existed at build time. Images uploaded later are served by a fallback rewrite (`/uploads/:file` → `src/app/api/uploads/[file]/route.ts`), so you never need to rebuild after an upload.

## Project layout

```
src/
  proxy.ts                     # Redirects /admin → /login without a valid session
  instrumentation.ts           # Opens the DB at server start (creates tables)
  lib/
    db.ts                      # SQLite schema, queries, demo seed
    session.ts                 # jose sign/verify (shared with proxy)
    auth.ts                    # Password check, cookie helpers, requireAdmin()
    uploads.ts                 # Magic-byte image validation, save/delete
    mail.ts                    # Nodemailer SMTP transport
    rate-limit.ts              # In-memory limiter (login + inquiries)
  app/
    page.tsx                   # Storefront grid (?category=, ?q=, ?product=)
    products/[id]/page.tsx     # Linkable product page
    actions/inquiry.ts         # "Inquire" Server Action → email
    login/                     # Login page + login/logout actions
    admin/                     # Dashboard, product form, list row, CRUD actions
    api/uploads/[file]/route.ts# Serves runtime uploads in production
  components/store/            # Grid, modal/detail, inquiry form, tabs, search
```

## Security notes

- Every admin Server Action calls `requireAdmin()`. The proxy only provides an early redirect and is not the sole check.
- Passwords are compared in constant time. Failed logins are rate limited (8 per 15 minutes per IP).
- Uploads are capped at 5 MB, and their type is checked from the file contents (JPG/PNG/WebP/GIF/AVIF). They get random file names.
- Inquiries use a honeypot field and a rate limit (5 per 10 minutes per IP). All user input is HTML-escaped in emails.
