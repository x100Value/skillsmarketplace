ALTER TABLE withdrawals
  ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ;

UPDATE withdrawals
SET available_at = requested_at + INTERVAL '22 days'
WHERE available_at IS NULL;

ALTER TABLE withdrawals
  ALTER COLUMN available_at SET NOT NULL;

ALTER TABLE withdrawals
  ALTER COLUMN available_at SET DEFAULT (NOW() + INTERVAL '22 days');

CREATE INDEX IF NOT EXISTS idx_withdrawals_status_available_at
  ON withdrawals(status, available_at ASC);
