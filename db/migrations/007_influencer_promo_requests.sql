CREATE TABLE IF NOT EXISTS influencer_promo_requests (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  audience_summary TEXT NOT NULL,
  channels JSONB NOT NULL DEFAULT '{}'::jsonb,
  extra_note TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_influencer_promo_requests_user_created
  ON influencer_promo_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_influencer_promo_requests_status_created
  ON influencer_promo_requests(status, created_at DESC);
