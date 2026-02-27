CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS balances (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_stars BIGINT NOT NULL DEFAULT 0 CHECK (total_stars >= 0),
  held_stars BIGINT NOT NULL DEFAULT 0 CHECK (held_stars >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount_stars BIGINT NOT NULL CHECK (amount_stars >= 0),
  ref_type TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id_created_at ON ledger_entries(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ledger_ref ON ledger_entries(ref_type, ref_id, type);

CREATE TABLE IF NOT EXISTS payment_events (
  id BIGSERIAL PRIMARY KEY,
  provider_event_id TEXT NOT NULL UNIQUE,
  telegram_payment_charge_id TEXT,
  telegram_user_id BIGINT,
  amount_stars BIGINT NOT NULL CHECK (amount_stars >= 0),
  status TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS llm_tasks (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  estimated_stars BIGINT NOT NULL CHECK (estimated_stars >= 0),
  actual_stars BIGINT NOT NULL DEFAULT 0 CHECK (actual_stars >= 0),
  result_text TEXT,
  error_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_llm_tasks_user_id_created_at ON llm_tasks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_stars BIGINT NOT NULL CHECK (amount_stars > 0),
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  decided_by TEXT,
  decision_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_requested_at ON withdrawals(status, requested_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
