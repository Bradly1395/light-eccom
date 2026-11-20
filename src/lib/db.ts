import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/* ────────────────────────────────────────────────────────────────
 * Local SQLite database stored at ./data/catalog.db
 * Tables are created automatically the first time the DB is opened
 * (on server start via src/instrumentation.ts, or lazily on first use).
 * ──────────────────────────────────────────────────────────────── */

export type Product = {
  id: number;
  title: string;
  category: string;
  price_text: string;
  description: string;
  specs: string; // one "Label: Value" pair per line
  image_path: string | null; // public URL path, e.g. /uploads/abc.jpg
  available: number; // 1 | 0 (SQLite has no boolean)
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  title: string;
  category: string;
  price_text: string;
  description: string;
  specs: string;
  image_path: string | null;
  available: boolean;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "catalog.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price_text  TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    specs       TEXT    NOT NULL DEFAULT '',
    image_path  TEXT,
    available   INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);
  CREATE INDEX IF NOT EXISTS idx_products_available ON products (available);
`;

// Reuse one connection across hot reloads in development.
const globalForDb = globalThis as unknown as { __catalogDb?: Database.Database };

function open(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const isNew = !fs.existsSync(DB_PATH);

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);

  if (isNew && process.env.SEED_DEMO_DATA !== "false") seed(db);
  return db;
}

export function getDb(): Database.Database {
  if (!globalForDb.__catalogDb) globalForDb.__catalogDb = open();
  return globalForDb.__catalogDb;
}

/* ─── Queries ──────────────────────────────────────────────────── */

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function listProducts(
  opts: { category?: string; q?: string; includeUnavailable?: boolean; availableFirst?: boolean } = {},
) {
  const where: string[] = [];
  const params: Record<string, string> = {};

  if (!opts.includeUnavailable) where.push("available = 1");
  if (opts.category) {
    where.push("category = @category COLLATE NOCASE");
    params.category = opts.category;
  }
  if (opts.q) {
    where.push(
      "(title LIKE @q ESCAPE '\\' OR description LIKE @q ESCAPE '\\' OR category LIKE @q ESCAPE '\\' OR specs LIKE @q ESCAPE '\\')",
    );
    params.q = `%${escapeLike(opts.q)}%`;
  }

  const sql = `SELECT * FROM products ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
               ORDER BY ${opts.availableFirst ? "available DESC, " : ""}created_at DESC, id DESC`;
  return getDb().prepare(sql).all(params) as Product[];
}

export function listCategories(opts: { includeUnavailable?: boolean } = {}) {
  const sql = `SELECT category, COUNT(*) AS count FROM products
               ${opts.includeUnavailable ? "" : "WHERE available = 1"}
               GROUP BY category COLLATE NOCASE ORDER BY category COLLATE NOCASE`;
  return getDb().prepare(sql).all() as { category: string; count: number }[];
}

export function getProduct(id: number) {
  return getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

export function createProduct(input: ProductInput) {
  const info = getDb()
    .prepare(
      `INSERT INTO products (title, category, price_text, description, specs, image_path, available)
       VALUES (@title, @category, @price_text, @description, @specs, @image_path, @available)`,
    )
    .run({ ...input, available: input.available ? 1 : 0 });
  return Number(info.lastInsertRowid);
}

export function updateProduct(id: number, input: ProductInput) {
  getDb()
    .prepare(
      `UPDATE products SET title = @title, category = @category, price_text = @price_text,
         description = @description, specs = @specs, image_path = @image_path,
         available = @available, updated_at = datetime('now')
       WHERE id = @id`,
    )
    .run({ ...input, available: input.available ? 1 : 0, id });
}

export function setAvailability(id: number, available: boolean) {
  getDb()
    .prepare("UPDATE products SET available = ?, updated_at = datetime('now') WHERE id = ?")
    .run(available ? 1 : 0, id);
}

export function deleteProduct(id: number) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function countProducts() {
  return getDb()
    .prepare("SELECT COUNT(*) AS total, COALESCE(SUM(available), 0) AS available FROM products")
    .get() as { total: number; available: number };
}

/* ─── Demo seed (runs once, when the DB file is first created) ── */

function seed(db: Database.Database) {
  const demo: Omit<ProductInput, "available">[] = [
    {
      title: "Speckled Stoneware Bud Vase",
      category: "Ceramics",
      price_text: "$68",
      description:
        "Wheel-thrown in small batches from iron-flecked stoneware and finished in a soft satin white glaze. The narrow neck holds a single stem or a loose sprig of dried grasses.",
      specs: "Material: Speckled stoneware\nHeight: 18 cm\nDiameter: 12 cm\nFinish: Satin white glaze\nCare: Hand wash only",
      image_path: "/demo/ceramic-vase.jpg",
    },
    {
      title: "Oak & Cord Lounge Chair",
      category: "Furniture",
      price_text: "From $1,480",
      description:
        "A low, generous lounge chair in solid white oak with a hand-woven paper cord seat and back. Each frame is joined with traditional mortise-and-tenon joints and finished with natural oil.",
      specs: "Frame: Solid white oak, oiled\nSeat: Hand-woven Danish paper cord\nDimensions: W 71 × D 74 × H 72 cm\nSeat height: 36 cm\nLead time: 6–8 weeks",
      image_path: "/demo/oak-chair.jpg",
    },
    {
      title: "Pleated Brass Table Lamp",
      category: "Lighting",
      price_text: "$420",
      description:
        "Brushed solid brass with an adjustable stem and a hand-pleated linen shade. Wired with a braided cotton cord and an inline dimmer for warm, low evening light.",
      specs: "Body: Brushed solid brass\nShade: Pleated Belgian linen\nHeight: 48–60 cm (adjustable)\nBulb: E26, max 60 W LED\nCord: 2 m braided cotton",
      image_path: "/demo/brass-lamp.jpg",
    },
    {
      title: "Stonewashed Linen Throw",
      category: "Textiles",
      price_text: "$185",
      description:
        "Heavyweight European flax, stonewashed for a lived-in softness from the first use. Finished with a knotted fringe on two sides. Gets better with every wash.",
      specs: "Material: 100% European linen\nSize: 130 × 180 cm\nWeight: 320 g/m²\nColour: Terracotta\nCare: Machine wash cold",
      image_path: "/demo/linen-throw.jpg",
    },
    {
      title: "Black Walnut Serving Board",
      category: "Kitchen",
      price_text: "$110",
      description:
        "Cut from a single piece of American black walnut, shaped by hand, and finished with food-safe oil and beeswax. Large enough for a full spread of bread and cheese.",
      specs: "Material: American black walnut\nSize: 48 × 28 × 2 cm\nFinish: Food-safe oil & beeswax\nCare: Hand wash, re-oil monthly",
      image_path: "/demo/walnut-board.jpg",
    },
    {
      title: "Sage Drip Mug — Set of Two",
      category: "Ceramics",
      price_text: "Request a quote",
      description:
        "A pair of round-bellied mugs with a glossy sage glaze poured over raw, speckled clay. Available in larger quantities for cafés and restaurants — ask us about trade pricing.",
      specs: "Material: Stoneware\nCapacity: 350 ml each\nFinish: Glossy sage glaze, raw base\nCare: Dishwasher & microwave safe",
      image_path: "/demo/stoneware-mugs.jpg",
    },
  ];

  const insert = db.prepare(
    `INSERT INTO products (title, category, price_text, description, specs, image_path, available, created_at, updated_at)
     VALUES (@title, @category, @price_text, @description, @specs, @image_path, 1,
             datetime('now', @offset), datetime('now', @offset))`,
  );
  const tx = db.transaction(() => {
    demo.forEach((p, i) => insert.run({ ...p, offset: `-${demo.length - i} minutes` }));
  });
  tx();
}
