-- Agent ejection exports: ZIP + fingerprint + attestation tracking (see ejection.service.ts)

CREATE TABLE IF NOT EXISTS ejections (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 VARCHAR(255)  NOT NULL,
  user_agent_id           UUID          NOT NULL REFERENCES user_agents(id),
  month_key               VARCHAR(10)   NOT NULL,
  fingerprint_hash        VARCHAR(128)  NOT NULL UNIQUE,
  s3_key                  VARCHAR(500)  NOT NULL,
  attestation_signed_at   TIMESTAMPTZ,
  attestation_s3_key      VARCHAR(500),
  status                  VARCHAR(50)   NOT NULL DEFAULT 'pending_attestation',
  exported_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  subscription_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  detected_double_hosting BOOLEAN       NOT NULL DEFAULT FALSE,
  double_hosting_evidence JSONB,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ejections_user_month
  ON ejections (user_id, month_key);
CREATE INDEX IF NOT EXISTS idx_ejections_fingerprint
  ON ejections (fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_ejections_user_agent
  ON ejections (user_agent_id);
