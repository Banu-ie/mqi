import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

const rawUrl = process.env.DATABASE_URL || "file:./dev.db";

const dbPath = rawUrl.startsWith("file:")
  ? rawUrl.slice("file:".length)
  : rawUrl;

// Anchor relative paths to the backend root rather than process.cwd(), so
// `npm run seed` from the repo root and `node dist/index.js` from backend/
// open the same file instead of silently creating two databases.
const BACKEND_ROOT = path.join(__dirname, "..", "..");

const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(BACKEND_ROOT, dbPath);

export const db = new Database(resolvedPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function runMigrations() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

runMigrations();
