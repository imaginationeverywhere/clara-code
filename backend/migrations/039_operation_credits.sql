-- Operation credits: weighted usage per billing month.
-- Weight-0 and weight-1 operations are never written here.
-- Run: psql $DATABASE_URL -f backend/migrations/039_operation_credits.sql

CREATE TABLE IF NOT EXISTS operation_credits (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        VARCHAR(255) NOT NULL,
  agent_id       VARCHAR(255) NOT NULL,
  billing_month  DATE         NOT NULL,

  -- Cumulative credits consumed this billing month
  credits_used   INTEGER      NOT NULL DEFAULT 0,

  -- Breakdown by weight tier
  medium_ops     INTEGER      NOT NULL DEFAULT 0,  -- weight 3 each
  heavy_ops      INTEGER      NOT NULL DEFAULT 0,  -- weight 5 each
  critical_ops   INTEGER      NOT NULL DEFAULT 0,  -- weight 10 each
  agent_builds   INTEGER      NOT NULL DEFAULT 0,  -- weight 20 each

  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, agent_id, billing_month)
);

CREATE INDEX IF NOT EXISTS idx_op_credits_user_month
  ON operation_credits (user_id, billing_month);
