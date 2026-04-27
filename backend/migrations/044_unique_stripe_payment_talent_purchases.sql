-- Deduplicate Stripe webhooks for talent purchase rows.
-- Run: psql $DATABASE_URL -f backend/migrations/044_unique_stripe_payment_talent_purchases.sql

CREATE UNIQUE INDEX IF NOT EXISTS uq_agent_talent_purchases_stripe_payment
  ON agent_talent_purchases (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;
