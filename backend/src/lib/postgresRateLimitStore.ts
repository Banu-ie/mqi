import { createHash } from "node:crypto";
import type { Options, Store, ClientRateLimitInfo } from "express-rate-limit";
import { pool } from "../db";
import { logger } from "./logger";

/** Shared rate limit counters survive restarts and are common to all instances. */
export class PostgresRateLimitStore implements Store {
  readonly localKeys = false;
  private windowMs = 15 * 60 * 1000;
  private readonly scope: string;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(scope: string) {
    this.scope = scope;
  }

  init(options: Options) {
    this.windowMs = options.windowMs;
    this.cleanupTimer = setInterval(() => {
      void pool
        .query("DELETE FROM rate_limit_hits WHERE reset_at < now()")
        .catch((error) => logger.error(error, "Failed to clean expired rate limits"));
    }, 60 * 60 * 1000);
    this.cleanupTimer.unref();
  }

  private hash(key: string) {
    return createHash("sha256").update(key).digest("hex");
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const resetAt = new Date(Date.now() + this.windowMs);
    const { rows } = await pool.query<{ hit_count: number; reset_at: Date }>(
      `INSERT INTO rate_limit_hits (scope, key_hash, hit_count, reset_at)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (scope, key_hash) DO UPDATE SET
         hit_count = CASE WHEN rate_limit_hits.reset_at <= now() THEN 1 ELSE rate_limit_hits.hit_count + 1 END,
         reset_at = CASE WHEN rate_limit_hits.reset_at <= now() THEN EXCLUDED.reset_at ELSE rate_limit_hits.reset_at END
       RETURNING hit_count, reset_at`,
      [this.scope, this.hash(key), resetAt],
    );
    return { totalHits: Number(rows[0].hit_count), resetTime: new Date(rows[0].reset_at) };
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const { rows } = await pool.query<{ hit_count: number; reset_at: Date }>(
      `SELECT hit_count, reset_at FROM rate_limit_hits
       WHERE scope = $1 AND key_hash = $2 AND reset_at > now()`,
      [this.scope, this.hash(key)],
    );
    return rows[0]
      ? { totalHits: Number(rows[0].hit_count), resetTime: new Date(rows[0].reset_at) }
      : undefined;
  }

  async decrement(key: string) {
    await pool.query(
      `UPDATE rate_limit_hits SET hit_count = GREATEST(hit_count - 1, 0)
       WHERE scope = $1 AND key_hash = $2`,
      [this.scope, this.hash(key)],
    );
  }

  async resetKey(key: string) {
    await pool.query("DELETE FROM rate_limit_hits WHERE scope = $1 AND key_hash = $2", [this.scope, this.hash(key)]);
  }

  async resetAll() {
    await pool.query("DELETE FROM rate_limit_hits WHERE scope = $1", [this.scope]);
  }

  async shutdown() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }
}
