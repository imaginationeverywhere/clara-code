-- New catalog rows are private by default; seed/public rows set is_public explicitly.
-- Run: psql $DATABASE_URL -f backend/migrations/046_default_talent_private.sql

ALTER TABLE agent_talent_catalog
  ALTER COLUMN is_public SET DEFAULT FALSE;
