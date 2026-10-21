CREATE TABLE IF NOT EXISTS crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(180) NOT NULL,
  website TEXT,
  industry VARCHAR(120),
  employee_count INTEGER CHECK (employee_count IS NULL OR employee_count >= 0),
  country VARCHAR(100),
  city VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'Prospect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80),
  email VARCHAR(320),
  phone VARCHAR(40),
  company VARCHAR(180),
  title VARCHAR(120),
  status VARCHAR(30) NOT NULL DEFAULT 'Unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80),
  company VARCHAR(180),
  email VARCHAR(320),
  phone VARCHAR(40),
  source VARCHAR(30) NOT NULL DEFAULT 'Other',
  status VARCHAR(30) NOT NULL DEFAULT 'New',
  owner VARCHAR(120),
  next_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(180) NOT NULL,
  company VARCHAR(180),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  stage VARCHAR(30) NOT NULL DEFAULT 'Qualification',
  amount NUMERIC(14, 2) CHECK (amount IS NULL OR amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  expected_close_date DATE,
  owner VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  related_to VARCHAR(180),
  due_at TIMESTAMPTZ,
  priority VARCHAR(20) NOT NULL DEFAULT 'Normal',
  status VARCHAR(20) NOT NULL DEFAULT 'Open',
  assignee VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_companies_name_idx ON crm_companies (LOWER(name));
CREATE INDEX IF NOT EXISTS crm_contacts_email_idx ON crm_contacts (LOWER(email));
CREATE INDEX IF NOT EXISTS crm_leads_status_idx ON crm_leads (status);
CREATE INDEX IF NOT EXISTS crm_leads_owner_idx ON crm_leads (owner);
CREATE INDEX IF NOT EXISTS crm_leads_follow_up_idx ON crm_leads (next_follow_up);
CREATE INDEX IF NOT EXISTS crm_deals_stage_idx ON crm_deals (stage);
CREATE INDEX IF NOT EXISTS crm_tasks_due_status_idx ON crm_tasks (due_at, status);
