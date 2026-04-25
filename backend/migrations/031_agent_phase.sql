-- Builder vs runtime phase on harness agents.
-- Run: psql $DATABASE_URL -f backend/migrations/031_agent_phase.sql

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS phase VARCHAR(20) NOT NULL DEFAULT 'builder'
    CHECK (phase IN ('builder', 'runtime'));

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS industry_vertical VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_agents_user_phase
  ON agents (user_id, phase);

COMMENT ON COLUMN agents.phase IS
  'builder = dev team; runtime = deployed customer-facing agents';
