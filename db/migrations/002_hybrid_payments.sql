CREATE TABLE IF NOT EXISTS crypto_payment_intents (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rail TEXT NOT NULL CHECK (rail IN ('ton_usdt')),
  amount_usdt NUMERIC(20, 6) NOT NULL CHECK (amount_usdt > 0),
  amount_stars BIGINT NOT NULL CHECK (amount_stars > 0),
  payment_memo TEXT NOT NULL UNIQUE,
  destination_address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'expired', 'canceled')),
  tx_hash TEXT UNIQUE,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crypto_payment_intents_user_status
  ON crypto_payment_intents(user_id, status, created_at DESC);
