ALTER TABLE users
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'active'
  CHECK (moderation_status IN ('active', 'under_review', 'banned'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_moderation_status
  ON users(moderation_status);

CREATE TABLE IF NOT EXISTS leak_reports (
  id UUID PRIMARY KEY,
  reporter_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suspect_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  suspect_role TEXT NOT NULL CHECK (suspect_role IN ('buyer', 'seller', 'unknown')),
  skill_ref TEXT,
  evidence TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'actioned', 'rejected')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_leak_reports_status_created
  ON leak_reports(status, created_at DESC);
