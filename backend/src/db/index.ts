import fs from "node:fs";
import path from "node:path";
import { Pool, types, type PoolClient } from "pg";

// NUMERIC arrives as a string by default, which would turn `price` into a
// string in every API response. Parse it as a float so the JSON shape matches
// what the frontend has always received.
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set a PostgreSQL connection string.",
  );
}

// This application keeps its tables in a dedicated schema rather than `public`,
// so it can share a database without colliding with anything already there.
const rawSchema = process.env.DATABASE_SCHEMA || "mqicma";
if (!/^[a-z_][a-z0-9_]*$/i.test(rawSchema)) {
  throw new Error(`DATABASE_SCHEMA must be a plain identifier, got "${rawSchema}".`);
}
export const SCHEMA = rawSchema;

export const pool = new Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX) || 10,
  connectionTimeoutMillis: 20_000,
  idleTimeoutMillis: 30_000,
});

// Every connection in the pool resolves unqualified table names to our schema.
pool.on("connect", (client) => {
  client.query(`SET search_path TO "${SCHEMA}"`);
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export async function query<T extends object>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T extends object>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Runs `sql` and reports how many rows it affected. */
export async function execute(sql: string, params: unknown[] = []): Promise<number> {
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
}

/**
 * Runs `fn` inside a transaction on a single dedicated connection. Commits on
 * success, rolls back on any thrown error.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

/**
 * Applies any migration files that have not run yet, in filename order, each in
 * its own transaction and recorded in `schema_migrations`. A Postgres advisory
 * lock keeps two booting instances from racing each other.
 */
export async function runMigrations(): Promise<string[]> {
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}"`);
    await client.query(`SET search_path TO "${SCHEMA}"`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // 4242 is an arbitrary but fixed key identifying this application's migrations.
    await client.query("SELECT pg_advisory_lock(4242)");
    try {
      const done = new Set(
        (await client.query<{ name: string }>("SELECT name FROM schema_migrations")).rows.map(
          (r) => r.name,
        ),
      );

      const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const file of files) {
        if (done.has(file)) continue;
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
          await client.query("COMMIT");
          applied.push(file);
        } catch (error) {
          await client.query("ROLLBACK");
          throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock(4242)");
    }
  } finally {
    client.release();
  }
  return applied;
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
