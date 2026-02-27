CREATE TABLE IF NOT EXISTS skill_checks (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  skill_text TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('free', 'paid', 'hybrid')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'done', 'failed')),
  estimated_stars BIGINT NOT NULL CHECK (estimated_stars >= 0),
  actual_stars BIGINT NOT NULL DEFAULT 0 CHECK (actual_stars >= 0),
  uniqueness_score INT CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100),
  risk_level TEXT,
  provider_used TEXT,
  queries JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  report JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_skill_checks_user_created
  ON skill_checks(user_id, created_at DESC);
