import fs from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, types, type PoolClient } from "pg";
import { logger } from "../lib/logger";

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
const migrationConnectionString = process.env.DATABASE_MIGRATION_URL;
const runtimeRole = process.env.DATABASE_RUNTIME_ROLE;
if (migrationConnectionString && !runtimeRole) {
  throw new Error(
    "DATABASE_MIGRATION_URL requires DATABASE_RUNTIME_ROLE so migration grants can be scoped to the app login.",
  );
}
if (
  runtimeRole &&
  !migrationConnectionString &&
  process.env.RUN_MIGRATIONS !== "false"
) {
  throw new Error(
    "A split runtime role requires DATABASE_MIGRATION_URL at startup, or set RUN_MIGRATIONS=false and run migrations in a privileged release job.",
  );
}
if (runtimeRole && !/^[a-z_][a-z0-9_]*$/i.test(runtimeRole)) {
  throw new Error("DATABASE_RUNTIME_ROLE must be a plain SQL identifier.");
}

// This application keeps its tables in a dedicated schema rather than `public`,
// so it can share a database without colliding with anything already there.
const rawSchema = process.env.DATABASE_SCHEMA || "mqicma";
if (!/^[a-z_][a-z0-9_]*$/i.test(rawSchema)) {
  throw new Error(
    `DATABASE_SCHEMA must be a plain identifier, got "${rawSchema}".`,
  );
}
export const SCHEMA = rawSchema;

export const pool = new Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX) || 10,
  connectionTimeoutMillis: 20_000,
  idleTimeoutMillis: 30_000,
});
const transactionContext = new AsyncLocalStorage<PoolClient>();
const migrationPool = migrationConnectionString
  ? new Pool({
      connectionString: migrationConnectionString,
      max: 2,
      connectionTimeoutMillis: 20_000,
      idleTimeoutMillis: 30_000,
    })
  : pool;

// How unqualified table names get resolved to SCHEMA is subtler than it looks,
// and two tempting approaches are both wrong here:
//
//  - A `SET search_path` in a `pool.on("connect")` handler cannot be awaited, so
//    it races the first real query. When the query wins, names resolve against
//    the default search_path and silently hit whatever same-named tables live in
//    `public`, surfacing as an intermittent "column ... does not exist".
//  - A `search_path` connection startup option is rejected by Neon's pooled
//    endpoint: "unsupported startup parameter in options: search_path".
//
// So the schema is made the *role's* default in runMigrations() instead. That is
// stored server-side and re-applied whenever the pooler resets a reused
// connection, and assertSchemaResolution() verifies it at boot.

pool.on("error", (error) => {
  logger.error(error, "Unexpected PostgreSQL pool error");
});
if (migrationPool !== pool) {
  migrationPool.on("error", (error) => {
    logger.error(error, "Unexpected PostgreSQL migration pool error");
  });
}

export async function query<T extends object>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const client = transactionContext.getStore();
  const result = client
    ? await client.query(sql, params)
    : await pool.query(sql, params);
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
export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const client = transactionContext.getStore();
  const result = client
    ? await client.query(sql, params)
    : await pool.query(sql, params);
  return result.rowCount ?? 0;
}

/**
 * Runs `fn` inside a transaction on a single dedicated connection. Commits on
 * success, rolls back on any thrown error.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await transactionContext.run(client, () => fn(client));
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
  if (runtimeRole && migrationPool === pool) {
    throw new Error("Migrations need DATABASE_MIGRATION_URL when using a split runtime role.");
  }
  const client = await migrationPool.connect();
  const applied: string[] = [];
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}"`);
    await client.query(`SET search_path TO "${SCHEMA}"`);

    // In single-role mode, make the schema the default for the current role.
    // In split-role mode, DATABASE_RUNTIME_ROLE must have its default search
    // path set by the database owner as documented in README.md.
    // A session-level `SET` alone is
    // not enough behind a transaction pooler, which reuses server connections
    // between transactions and resets them — discarding the setting. A role
    // default survives that, because a reset restores it rather than clearing
    // it. Not fatal if the role may not alter itself; assertSchemaResolution()
    // then fails at boot with a clearer message than a wrong-table read.
    if (!runtimeRole) {
      try {
        await client.query(
          `ALTER ROLE CURRENT_USER SET search_path TO "${SCHEMA}"`,
        );
      } catch (error) {
        logger.warn(
          "Could not set the default search_path for the current role",
          { code: (error as { code?: string }).code },
        );
        logger.warn(
          `Run once as a privileged user: ALTER ROLE <role> SET search_path TO "${SCHEMA}";`,
        );
      }
    }
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
        (
          await client.query<{ name: string }>(
            "SELECT name FROM schema_migrations",
          )
        ).rows.map((r) => r.name),
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
          await client.query(
            "INSERT INTO schema_migrations (name) VALUES ($1)",
            [file],
          );
          await client.query("COMMIT");
          applied.push(file);
        } catch (error) {
          await client.query("ROLLBACK");
          throw new Error(
            `Migration ${file} failed: ${(error as Error).message}`,
          );
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock(4242)");
    }

    if (runtimeRole) {
      const role = `"${runtimeRole}"`;
      await client.query(`GRANT USAGE ON SCHEMA "${SCHEMA}" TO ${role}`);
      await client.query(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "${SCHEMA}" TO ${role}`,
      );
      await client.query(
        `REVOKE DELETE ON TABLE "${SCHEMA}".admins FROM ${role}`,
      );
      await client.query(
        `REVOKE ALL ON TABLE "${SCHEMA}".schema_migrations FROM ${role}`,
      );
      await client.query(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA "${SCHEMA}" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${role}`,
      );
      await client.query(
        `ALTER DEFAULT PRIVILEGES IN SCHEMA "${SCHEMA}" REVOKE DELETE ON TABLES FROM ${role}`,
      );
    }
  } finally {
    client.release();
  }
  return applied;
}

/**
 * Confirms that a pooled connection really does resolve unqualified names to
 * SCHEMA. Called once at startup: if a connection proxy ever ignores or drops
 * the search_path startup option, refusing to boot is far better than serving
 * whichever same-named tables happen to sit in `public`.
 */
export async function assertSchemaResolution(): Promise<void> {
  const { rows } = await pool.query<{ schema: string | null; role: string }>(
    "SELECT current_schema() AS schema, current_user AS role",
  );
  const actual = rows[0]?.schema ?? null;
  const actualRole = rows[0]?.role;
  if (runtimeRole && actualRole !== runtimeRole) {
    throw new Error(
      `DATABASE_URL connected as ${JSON.stringify(actualRole)}, expected the limited role ${JSON.stringify(runtimeRole)}.`,
    );
  }
  if (actual !== SCHEMA) {
    throw new Error(
      `Unqualified table names resolve to ${JSON.stringify(actual)}, expected ${JSON.stringify(SCHEMA)}. ` +
        "The connection is not preserving the search_path startup option.",
    );
  }
}

export async function closeDb(): Promise<void> {
  await pool.end();
  if (migrationPool !== pool) await migrationPool.end();
}
