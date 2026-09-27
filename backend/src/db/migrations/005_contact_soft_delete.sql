ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contact_messages_active_created_at
  ON contact_messages (created_at DESC)
  WHERE deleted_at IS NULL;