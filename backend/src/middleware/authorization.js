const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { database } = require('../config/database');

async function authenticate(request, response, next) {
  const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Sign in to continue.' } });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { issuer: 'velvorax-crm', audience: 'velvorax-crm-web' });
    const result = await database.query(
      `SELECT users.id, users.full_name, users.email, users.token_version, roles.role_key,
        COALESCE(array_agg(role_permissions.permission_key) FILTER (WHERE role_permissions.permission_key IS NOT NULL), '{}') AS permissions
       FROM crm_users users
       JOIN crm_roles roles ON roles.id = users.role_id
       LEFT JOIN crm_role_permissions role_permissions ON role_permissions.role_id = roles.id
       WHERE users.id = $1 AND users.is_active = TRUE
       GROUP BY users.id, roles.role_key`,
      [payload.sub],
    );
    if (!result.rowCount) return response.status(401).json({ success: false, error: { code: 'ACCOUNT_UNAVAILABLE', message: 'This account is unavailable. Contact your administrator.' } });
    const user = result.rows[0];
    if (payload.ver !== user.token_version) return response.status(401).json({ success: false, error: { code: 'SESSION_REVOKED', message: 'Your session has ended. Please sign in again.' } });
    request.user = { id: user.id, fullName: user.full_name, email: user.email, role: user.role_key, permissions: user.permissions };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Your session is invalid or expired. Please sign in again.' } });
    }
    next(error);
  }
}

function requirePermission(permission) {
  return (request, response, next) => {
    if (!request.user?.permissions.includes(permission)) {
      return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Your role does not allow this action.' } });
    }
    next();
  };
}

module.exports = { authenticate, requirePermission };
