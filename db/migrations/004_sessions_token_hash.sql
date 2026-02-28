ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS token_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sessions_token_hash
  ON sessions(token_hash)
  WHERE token_hash IS NOT NULL;
