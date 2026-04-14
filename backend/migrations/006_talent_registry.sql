-- Talent Registry tables (Prompt 07). Run via Sequelize migration 007-talent-registry.js or manually.
-- developer_programs / talents / talent_installs

-- Talent developers who paid the $99/year Developer Program fee
CREATE TABLE IF NOT EXISTS developer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registered Talents
CREATE TABLE IF NOT EXISTS talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  pricing_type VARCHAR(50) NOT NULL DEFAULT 'free',
  price_cents INTEGER,
  subgraph_url TEXT,
  voice_commands JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_price_id VARCHAR(255),
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Which users have installed which Talents
CREATE TABLE IF NOT EXISTS talent_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  talent_id UUID NOT NULL REFERENCES talents(id),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_subscription_id VARCHAR(255),
  UNIQUE(user_id, talent_id)
);

CREATE INDEX IF NOT EXISTS idx_talents_status ON talents(status);
CREATE INDEX IF NOT EXISTS idx_talents_category ON talents(category);
CREATE INDEX IF NOT EXISTS idx_talent_installs_user ON talent_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_developer_programs_user ON developer_programs(user_id);
