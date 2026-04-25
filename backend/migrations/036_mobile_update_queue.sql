-- Mobile note capture: queued app-store updates (no hot reload on iOS/Android).
-- Run: psql $DATABASE_URL -f backend/migrations/036_mobile_update_queue.sql

CREATE TABLE IF NOT EXISTS mobile_update_requests (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id        UUID         NOT NULL REFERENCES site_agent_deployments(id) ON DELETE CASCADE,
  site_owner_user_id   VARCHAR(255) NOT NULL,
  heru_slug            VARCHAR(100) NOT NULL,
  platform             VARCHAR(20)  NOT NULL CHECK (platform IN ('ios','android','both')),

  raw_voice_transcript TEXT         NOT NULL,
  agent_interpretation TEXT         NOT NULL,
  structured_spec      JSONB        NOT NULL,

  priority             VARCHAR(20)  NOT NULL DEFAULT 'normal',
  status               VARCHAR(30)  NOT NULL DEFAULT 'pending_review',
  target_release       VARCHAR(50),
  approved_at          TIMESTAMPTZ,
  shipped_at           TIMESTAMPTZ,
  rejected_reason      TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mobile_reqs_deployment
  ON mobile_update_requests (deployment_id, status);
CREATE INDEX IF NOT EXISTS idx_mobile_reqs_owner
  ON mobile_update_requests (site_owner_user_id, status, created_at DESC);
