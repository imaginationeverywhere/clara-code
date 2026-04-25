-- Sprint and standup tracking for agent-speed SDLC.
-- Run: psql $DATABASE_URL -f backend/migrations/029_sprints_and_standups.sql

CREATE TABLE IF NOT EXISTS sprints (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,
  goal            TEXT         NOT NULL,
  status          VARCHAR(30)  NOT NULL DEFAULT 'active',
  retrospective   TEXT,
  started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  sprint_number   INTEGER      NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_sprints_user_status
  ON sprints (user_id, status);

CREATE TABLE IF NOT EXISTS sprint_tasks (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID         NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  user_id         VARCHAR(255) NOT NULL,
  agent_id        VARCHAR(255) NOT NULL,
  title           TEXT         NOT NULL,
  description     TEXT,
  status          VARCHAR(30)  NOT NULL DEFAULT 'claimed',
  blocker         TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint
  ON sprint_tasks (sprint_id, agent_id);

CREATE INDEX IF NOT EXISTS idx_sprint_tasks_agent
  ON sprint_tasks (user_id, agent_id, status);

CREATE TABLE IF NOT EXISTS standup_reports (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID         REFERENCES sprints(id) ON DELETE SET NULL,
  user_id         VARCHAR(255) NOT NULL,
  agent_id        VARCHAR(255) NOT NULL,
  delivered       TEXT,
  in_progress     TEXT,
  blocked         TEXT,
  message_count   INTEGER      NOT NULL DEFAULT 0,
  turn_count      INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_standup_sprint_agent
  ON standup_reports (sprint_id, agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_standup_user_created
  ON standup_reports (user_id, created_at DESC);
