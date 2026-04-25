-- Harness agent template catalog (seed for /config-agent).
-- Run: psql $DATABASE_URL -f backend/migrations/032_agent_templates.sql

CREATE TABLE IF NOT EXISTS agent_templates (
  id                    VARCHAR(100)  PRIMARY KEY,
  display_name          VARCHAR(255)  NOT NULL,
  short_description     TEXT          NOT NULL,
  category              VARCHAR(50)   NOT NULL,
  industry_vertical     VARCHAR(50),
  soul_md_template      TEXT          NOT NULL,
  suggested_skills      JSONB         NOT NULL DEFAULT '[]',
  default_voice_id      VARCHAR(100)  NOT NULL DEFAULT 'clara-default',
  is_public             BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order            INTEGER       NOT NULL DEFAULT 100,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_agent_templates_vertical ON agent_templates (industry_vertical) WHERE industry_vertical IS NOT NULL;

INSERT INTO agent_templates (id, display_name, short_description, category, industry_vertical, soul_md_template, suggested_skills, default_voice_id, is_public, sort_order)
VALUES
  (
    'frontend-engineer',
    'Frontend Engineer',
    'React, Next.js, Tailwind. Ships user interfaces that feel great.',
    'Technical',
    NULL,
    'You are {AGENT_NAME}, a frontend engineer. You ship fast, accessible, beautiful user interfaces using React and Next.js.',
    '[
      {"id": "react", "name": "React"},
      {"id": "nextjs", "name": "Next.js"},
      {"id": "tailwind", "name": "Tailwind CSS"},
      {"id": "typescript-frontend", "name": "TypeScript (frontend)"}
    ]'::jsonb,
    'clara-default',
    TRUE,
    0
  ),
  (
    'accountant',
    'Accountant',
    'Books, invoices, taxes. Keeps your money organized.',
    'Business Operations',
    NULL,
    'You are {AGENT_NAME}, an accountant. You reconcile books, draft invoices, and flag cash flow issues. You are precise with numbers.',
    '[
      {"id": "quickbooks", "name": "QuickBooks"},
      {"id": "stripe-accounting", "name": "Stripe financial reports"},
      {"id": "invoicing", "name": "Invoicing"}
    ]'::jsonb,
    'clara-default',
    TRUE,
    10
  ),
  (
    'content-creator',
    'Content Creator',
    'Short-form scripts, calendars, and platform-native ideas.',
    'Creative',
    NULL,
    'You are {AGENT_NAME}, a content creator. You write short-form video scripts and content calendars.',
    '[
      {"id": "short-form-video", "name": "Short-form video scripts"},
      {"id": "hashtag-strategy", "name": "Hashtag strategy"},
      {"id": "content-calendar", "name": "Content calendars"}
    ]'::jsonb,
    'clara-default',
    TRUE,
    20
  )
ON CONFLICT (id) DO NOTHING;
