-- User usage (write-through with Redis) and immutable API usage log (abuse + COGS).
-- Run: psql $DATABASE_URL -f backend/migrations/038_user_usage_and_usage_events.sql

CREATE TABLE IF NOT EXISTS user_usage (
  user_id       VARCHAR(255) PRIMARY KEY,
  tier          VARCHAR(50)   NOT NULL DEFAULT 'basic',
  month_key     VARCHAR(10)   NOT NULL,
  active_hours  NUMERIC(10,2) NOT NULL DEFAULT 0,
  cogs_usd      NUMERIC(10,4) NOT NULL DEFAULT 0,
  is_flagged    BOOLEAN       NOT NULL DEFAULT FALSE,
  is_frozen     BOOLEAN       NOT NULL DEFAULT FALSE,
  flagged_at    TIMESTAMPTZ,
  frozen_at     TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_usage_tier ON user_usage (tier);
CREATE INDEX IF NOT EXISTS idx_user_usage_flagged ON user_usage (is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_usage_frozen ON user_usage (is_frozen) WHERE is_frozen = TRUE;

CREATE TABLE IF NOT EXISTS usage_events (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                VARCHAR(255)  NOT NULL,
  agent_id               VARCHAR(255),
  model_used             VARCHAR(50)   NOT NULL,
  task_type              VARCHAR(50),
  bedrock_input_tokens   INTEGER       NOT NULL DEFAULT 0,
  bedrock_output_tokens  INTEGER       NOT NULL DEFAULT 0,
  modal_compute_seconds  NUMERIC(8,3)  NOT NULL DEFAULT 0,
  cogs_usd               NUMERIC(10,6) NOT NULL DEFAULT 0,
  cache_hit              BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_month
  ON usage_events (user_id, created_at DESC);
