ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_referral_code_upper
  ON users ((upper(referral_code)))
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_referred_by
  ON users (referred_by);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_event_id TEXT NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 3),
  amount_stars BIGINT NOT NULL CHECK (amount_stars > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_user_created
  ON referral_earnings (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_earnings_user_source_level
  ON referral_earnings (user_id, source_event_id, level);
