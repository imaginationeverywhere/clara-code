-- Agent-aware persistent memory for Clara and all harness agents.
-- Run via: psql $DATABASE_URL -f backend/migrations/007_user_memory.sql

-- Short-term: individual conversation turns, scoped per user + agent
CREATE TABLE IF NOT EXISTS conversation_turns (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL,
  agent_id     VARCHAR(255) NOT NULL DEFAULT 'clara', -- 'clara' or harness agent UUID
  session_id   VARCHAR(255) NOT NULL,
  surface      VARCHAR(50)  NOT NULL DEFAULT 'cli',   -- 'cli' | 'web' | 'desktop'
  role         VARCHAR(20)  NOT NULL,                 -- 'user' | 'assistant'
  content      TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turns_user_agent_created
  ON conversation_turns (user_id, agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_turns_session
  ON conversation_turns (session_id, created_at ASC);

-- Long-term: AI-compressed memory, one row per (user, agent) pair
CREATE TABLE IF NOT EXISTS agent_user_memory (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              VARCHAR(255) NOT NULL,
  agent_id             VARCHAR(255) NOT NULL DEFAULT 'clara',
  summary              TEXT,                        -- AI-written paragraph
  key_facts            JSONB        NOT NULL DEFAULT '[]',
  last_session_at      TIMESTAMPTZ,
  last_session_surface VARCHAR(50),
  total_sessions       INTEGER      NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_user_memory_lookup
  ON agent_user_memory (user_id, agent_id);
