-- Legacy UUIDs are retained for existing rows only; new records use numeric IDs.
ALTER TABLE crm_companies ALTER COLUMN legacy_uuid DROP NOT NULL;
ALTER TABLE crm_contacts ALTER COLUMN legacy_uuid DROP NOT NULL;
ALTER TABLE crm_leads ALTER COLUMN legacy_uuid DROP NOT NULL;
ALTER TABLE crm_deals ALTER COLUMN legacy_uuid DROP NOT NULL;
ALTER TABLE crm_tasks ALTER COLUMN legacy_uuid DROP NOT NULL;
