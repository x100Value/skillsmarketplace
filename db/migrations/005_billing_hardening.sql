ALTER TABLE payment_events
  ADD CONSTRAINT payment_events_amount_positive
  CHECK (amount_stars > 0)
  NOT VALID;

ALTER TABLE balances
  ADD CONSTRAINT balances_held_not_exceed_total
  CHECK (held_stars <= total_stars)
  NOT VALID;
