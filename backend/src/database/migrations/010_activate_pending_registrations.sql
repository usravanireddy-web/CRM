UPDATE crm_users
SET is_active = TRUE,
    registration_status = 'approved',
    updated_at = NOW()
WHERE registration_status = 'pending';
