ALTER TABLE crm_users
ADD COLUMN registration_status VARCHAR(20) NOT NULL DEFAULT 'approved'
CHECK (registration_status IN ('pending', 'approved'));
