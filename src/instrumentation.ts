/* Runs once when the Next.js server starts. Opening the database here
 * creates ./data/catalog.db and its tables before the first request. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDb } = await import("./lib/db");
    getDb();
    console.info("[catalog] SQLite ready at ./data/catalog.db");
  }
}
