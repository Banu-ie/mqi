-- Uploaded images move off the container's filesystem and into the database.
--
-- Render's free instance has an ephemeral filesystem: every deploy, restart and
-- wake-from-idle replaces the container and resets it to what the build
-- produced. Images written to backend/uploads at runtime were therefore erased
-- within hours while the product rows kept pointing at them, so admin uploads
-- turned into broken links twice in two days. A persistent disk would fix it
-- but needs a paid instance.
--
-- The database is the only storage this deployment actually keeps, so the bytes
-- live here and are streamed back by GET /uploads/:kind/:id.ext. Nothing has to
-- be committed or redeployed for an upload to survive — which matters because
-- the admins will keep using this site after the developers hand it over.
--
-- BYTEA rather than large objects: these are small (images are resized and
-- re-encoded to WebP on upload, typically well under 300 kB), always fetched
-- whole, and BYTEA needs no out-of-band handle to leak or clean up.
CREATE TABLE IF NOT EXISTS uploads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT NOT NULL CHECK (kind IN ('products', 'services', 'events')),
  mime       TEXT NOT NULL,
  byte_size  INTEGER NOT NULL,
  bytes      BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
