CREATE TABLE IF NOT EXISTS rate_limit_hits (
  scope TEXT NOT NULL,
  key_hash CHAR(64) NOT NULL,
  hit_count INTEGER NOT NULL CHECK (hit_count >= 0),
  reset_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (scope, key_hash)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_reset_at ON rate_limit_hits (reset_at);
