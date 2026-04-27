-- Immutable wallet transaction ledger (every debit/credit).
-- Idempotency keys prevent double-charge on retried calls.
-- Run: psql $DATABASE_URL -f backend/migrations/043_wallet_transactions.sql

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           VARCHAR(255)  NOT NULL,
  amount_usd        NUMERIC(12,2) NOT NULL,
  transaction_type  VARCHAR(20)   NOT NULL,
  reference         VARCHAR(255)  NOT NULL,
  idempotency_key   VARCHAR(64)   NOT NULL UNIQUE,
  metadata          JSONB         NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON wallet_transactions (reference) WHERE reference IS NOT NULL;

ALTER TABLE agent_talent_purchases
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64) UNIQUE;
