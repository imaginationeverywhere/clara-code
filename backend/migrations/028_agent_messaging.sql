-- Agent-to-agent async messaging.
-- Run: psql $DATABASE_URL -f backend/migrations/028_agent_messaging.sql

CREATE TABLE IF NOT EXISTS agent_messages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,
  from_agent_id   VARCHAR(255) NOT NULL,
  to_agent_id     VARCHAR(255) NOT NULL,
  thread_id       UUID         NOT NULL DEFAULT gen_random_uuid(),
  message_type    VARCHAR(50)  NOT NULL DEFAULT 'request',
  content         TEXT         NOT NULL,
  metadata        JSONB        NOT NULL DEFAULT '{}',
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_inbox
  ON agent_messages (user_id, to_agent_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_agent_messages_thread
  ON agent_messages (thread_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_agent_messages_from
  ON agent_messages (user_id, from_agent_id, created_at DESC);
