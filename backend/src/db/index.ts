import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

const rawUrl = process.env.DATABASE_URL || "file:./dev.db";

const dbPath = rawUrl.startsWith("file:")
  ? rawUrl.slice("file:".length)
  : rawUrl;

const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

export const db = new Database(resolvedPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function runMigrations() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

runMigrations();
