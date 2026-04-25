-- Per-agent Talents (VARCHAR-id catalog) — separate from `talents` in 006 (UUID marketplace registry).
-- Run: psql $DATABASE_URL -f backend/migrations/040_harness_talent_catalog_and_wallet.sql

-- Wallet balance for in-app debits (Talent purchases, etc.)
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id     VARCHAR(255) PRIMARY KEY,
  balance_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_talent_catalog (
  id                 VARCHAR(100)  PRIMARY KEY,
  display_name       VARCHAR(255)  NOT NULL,
  description        TEXT          NOT NULL,
  category           VARCHAR(50)   NOT NULL,
  domain             VARCHAR(50),
  industry_vertical  VARCHAR(50),
  knowledge_content  TEXT          NOT NULL,
  associated_gears   JSONB         NOT NULL DEFAULT '[]',
  pricing_model      VARCHAR(20)   NOT NULL,
  price_usd          NUMERIC(8,2)  NOT NULL DEFAULT 0,
  monthly_price_usd  NUMERIC(8,2),
  publisher_user_id  VARCHAR(255),
  publisher_revenue_share NUMERIC(4,3) NOT NULL DEFAULT 0.85,
  is_public          BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_talent_catalog_category ON agent_talent_catalog (category, domain);
CREATE INDEX IF NOT EXISTS idx_agent_talent_catalog_vertical
  ON agent_talent_catalog (industry_vertical) WHERE industry_vertical IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_talent_catalog_publisher
  ON agent_talent_catalog (publisher_user_id) WHERE publisher_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_talent_library (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            VARCHAR(255) NOT NULL,
  talent_id          VARCHAR(100) NOT NULL REFERENCES agent_talent_catalog(id),
  acquired_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  acquisition_type   VARCHAR(20)  NOT NULL,
  purchase_price_usd NUMERIC(8,2),
  subscription_active BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_talent_lib_user ON user_talent_library (user_id);

CREATE TABLE IF NOT EXISTS agent_talent_attachments (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent_id UUID         NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
  talent_id     VARCHAR(100) NOT NULL REFERENCES agent_talent_catalog(id),
  user_id       VARCHAR(255) NOT NULL,
  attached_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_agent_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_talent_att_agent ON agent_talent_attachments (user_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_talent_att_user ON agent_talent_attachments (user_id);

CREATE TABLE IF NOT EXISTS agent_talent_purchases (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            VARCHAR(255) NOT NULL,
  talent_id          VARCHAR(100) NOT NULL,
  acquisition_type   VARCHAR(20)  NOT NULL,
  amount_usd         NUMERIC(8,2) NOT NULL,
  publisher_user_id  VARCHAR(255),
  publisher_payout_usd NUMERIC(8,2),
  clara_revenue_usd  NUMERIC(8,2) NOT NULL,
  stripe_payment_id  VARCHAR(255),
  purchased_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_talent_pur_user
  ON agent_talent_purchases (user_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_talent_pur_publisher
  ON agent_talent_purchases (publisher_user_id, purchased_at DESC) WHERE publisher_user_id IS NOT NULL;
