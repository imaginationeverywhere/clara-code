-- SITE_OWNER overlay on user_agents deployed per Heru.
-- Run: psql $DATABASE_URL -f backend/migrations/035_site_owner_interactions.sql

CREATE TABLE IF NOT EXISTS site_agent_deployments (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent_id            UUID         NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  heru_slug                VARCHAR(100) NOT NULL,
  site_owner_user_id       VARCHAR(255) NOT NULL,
  deployment_status        VARCHAR(50)  NOT NULL DEFAULT 'active',
  deployed_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_owner_instructions (
  id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id             UUID         NOT NULL REFERENCES site_agent_deployments(id) ON DELETE CASCADE,
  instruction               TEXT         NOT NULL,
  category                  VARCHAR(50)  NOT NULL,
  approved_by_platform      BOOLEAN      NOT NULL DEFAULT FALSE,
  platform_rejection_reason TEXT,
  effective_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_owner_change_log (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id      UUID         NOT NULL REFERENCES site_agent_deployments(id),
  site_owner_user_id VARCHAR(255) NOT NULL,
  action_type          VARCHAR(50)  NOT NULL,
  before_value         JSONB,
  after_value          JSONB,
  approved             BOOLEAN      NOT NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_heru ON site_agent_deployments (heru_slug, deployment_status);
CREATE INDEX IF NOT EXISTS idx_instructions_deployment ON site_owner_instructions (deployment_id, approved_by_platform);
CREATE INDEX IF NOT EXISTS idx_deployments_owner ON site_agent_deployments (site_owner_user_id, deployment_status);
