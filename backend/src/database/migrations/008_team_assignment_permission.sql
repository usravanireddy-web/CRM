INSERT INTO crm_permissions(permission_key, description)
VALUES ('assignments:manage', 'Manage team record assignments')
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO crm_role_permissions(role_id, permission_key)
SELECT roles.id, permissions.permission_key
FROM crm_roles roles
JOIN crm_permissions permissions ON permissions.permission_key IN ('assignments:manage', 'users:read')
WHERE roles.role_key IN ('admin', 'sales_manager')
ON CONFLICT DO NOTHING;
