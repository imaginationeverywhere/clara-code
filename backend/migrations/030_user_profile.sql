-- Global user profile — readable by all agents, maintained by Clara.
-- Run: psql $DATABASE_URL -f backend/migrations/030_user_profile.sql

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id           VARCHAR(255) PRIMARY KEY,
  display_name      TEXT,
  active_projects   JSONB NOT NULL DEFAULT '[]',
  tech_stack        JSONB NOT NULL DEFAULT '[]',
  preferences       JSONB NOT NULL DEFAULT '[]',
  cross_agent_log   JSONB NOT NULL DEFAULT '[]',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
