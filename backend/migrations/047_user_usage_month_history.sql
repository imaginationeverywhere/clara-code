-- Preserve prior-month rows when the calendar month changes (abuse/COGS audit).
-- Run: psql $DATABASE_URL -f backend/migrations/047_user_usage_month_history.sql

CREATE TABLE IF NOT EXISTS user_usage_history (
  user_id        VARCHAR(255) NOT NULL,
  month_key      VARCHAR(10)  NOT NULL,
  tier           VARCHAR(50)  NOT NULL,
  active_hours   NUMERIC(10,2) NOT NULL DEFAULT 0,
  cogs_usd       NUMERIC(10,4) NOT NULL DEFAULT 0,
  is_flagged     BOOLEAN        NOT NULL DEFAULT FALSE,
  is_frozen      BOOLEAN        NOT NULL DEFAULT FALSE,
  flagged_at     TIMESTAMPTZ,
  frozen_at      TIMESTAMPTZ,
  archived_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, month_key)
);

CREATE INDEX IF NOT EXISTS idx_user_usage_hist_archived
  ON user_usage_history (archived_at DESC);
