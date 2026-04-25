-- User-configured harness agents (instances cloned from agent_templates).
-- Run: psql $DATABASE_URL -f backend/migrations/033_user_agents.sql

CREATE TABLE IF NOT EXISTS user_agents (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             VARCHAR(255)  NOT NULL,
  template_id         VARCHAR(100)  NOT NULL,
  name                VARCHAR(100)  NOT NULL,
  voice_id            VARCHAR(100)  NOT NULL,
  attached_skills     JSONB         NOT NULL DEFAULT '[]',
  personality_tweaks  JSONB         NOT NULL DEFAULT '{}',
  soul_md             TEXT          NOT NULL,
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_agents_user_active
  ON user_agents (user_id, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_agents_user_name
  ON user_agents (user_id, LOWER(name)) WHERE is_active = TRUE;
