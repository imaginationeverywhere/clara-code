-- MCP catalog + per-agent connections. agent_id references agents (not legacy user_agents name).
-- Run in dev/staging/prod per backend migration process.

CREATE TABLE IF NOT EXISTS mcp_servers (
  id                    VARCHAR(100)   PRIMARY KEY,
  display_name          VARCHAR(255)  NOT NULL,
  description           TEXT,
  category              VARCHAR(50)  NOT NULL,
  owner_type            VARCHAR(20)  NOT NULL DEFAULT 'clara',
  owner_user_id         VARCHAR(255),
  endpoint_url          VARCHAR(500) NOT NULL,
  auth_scheme           VARCHAR(50)  NOT NULL,
  min_tier              VARCHAR(50)  NOT NULL DEFAULT 'basic',
  is_public             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_mcp_connections (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id              UUID         NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
  mcp_server_id         VARCHAR(100) NOT NULL REFERENCES mcp_servers (id),
  user_id               VARCHAR(255) NOT NULL,
  credentials_ciphertext TEXT,
  enabled_tools         JSONB        NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, mcp_server_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_mcp_agent ON agent_mcp_connections (agent_id);
