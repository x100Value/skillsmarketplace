CREATE TABLE IF NOT EXISTS stars_topup_orders (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  amount_stars BIGINT NOT NULL CHECK (amount_stars > 0),
  invoice_payload TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'expired', 'canceled')),
  provider_event_id TEXT UNIQUE,
  telegram_payment_charge_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stars_topup_orders_user_status_created
  ON stars_topup_orders(user_id, status, created_at DESC);

