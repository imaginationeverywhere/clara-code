-- Extends `subscriptions` (Sequelize model) with trial, cancellation, and Enterprise contract.
-- Maps to the user_subscriptions shape from the billing spec (same table, UUID id + user_id).

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enterprise_contract JSONB;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

CREATE OR REPLACE VIEW user_subscriptions AS
SELECT
  user_id,
  tier,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  trial_ends_at,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  enterprise_contract,
  updated_at
FROM subscriptions;
