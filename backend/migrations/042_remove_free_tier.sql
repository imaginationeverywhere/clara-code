-- Backfill existing 'free' rows to 'basic' (lowest paid tier) and change column defaults.
-- Eliminates the 'free' tier from the subscription/api-key surface per the canonical
-- "no free tier anywhere" rule. Ahead of this, code defaults `?? 'free'` are migrated
-- to `?? 'basic'` and the PlanTier union no longer includes 'free'.

UPDATE subscriptions SET tier = 'basic' WHERE tier = 'free';
UPDATE api_keys     SET tier = 'basic' WHERE tier = 'free';
UPDATE user_usage   SET tier = 'basic' WHERE tier = 'free';

ALTER TABLE subscriptions ALTER COLUMN tier SET DEFAULT 'basic';
ALTER TABLE api_keys      ALTER COLUMN tier SET DEFAULT 'basic';
ALTER TABLE user_usage    ALTER COLUMN tier SET DEFAULT 'basic';
