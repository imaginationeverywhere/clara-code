-- Reject negative wallet balance at DB level.
-- Run: psql $DATABASE_URL -f backend/migrations/045_wallet_balance_nonneg.sql

ALTER TABLE user_wallets
  DROP CONSTRAINT IF EXISTS user_wallets_balance_nonneg;

ALTER TABLE user_wallets
  ADD CONSTRAINT user_wallets_balance_nonneg
  CHECK (balance_usd >= 0);
