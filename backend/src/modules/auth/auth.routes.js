const { Router } = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const { database } = require('../../config/database');
const { env } = require('../../config/env');
const { authenticate, requirePermission } = require('../../middleware/authorization');
const { validateBody } = require('../../middleware/validate');

const authRoutes = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'LOGIN_RATE_LIMITED', message: 'Too many sign-in attempts. Wait 15 minutes and try again.' } },
});
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'REGISTRATION_RATE_LIMITED', message: 'Too many registration requests. Try again in 15 minutes.' } },
});
const loginSchema = Joi.object({ email: Joi.string().trim().email().max(320).required(), password: Joi.string().min(1).max(200).required() }).unknown(false);
const passwordSchema = Joi.string().min(8).max(64).custom((value, helpers) => Buffer.byteLength(value, 'utf8') <= 72 ? value : helpers.error('string.maxBytes')).messages({
  'string.maxBytes': 'Password must not exceed 72 UTF-8 bytes.',
});
const registrationSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().max(320).lowercase().required(),
  password: passwordSchema.required(),
  role: Joi.string().valid('sales_rep', 'lead_researcher', 'marketing', 'telecaller').required(),
}).unknown(false);
const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().max(320).lowercase().required(),
  password: passwordSchema.required(),
  role: Joi.string().valid('admin', 'sales_manager', 'sales_rep', 'lead_researcher', 'marketing', 'telecaller').required(),
}).unknown(false);

authRoutes.post('/register', registrationLimiter, validateBody(registrationSchema), async (request, response, next) => {
  try {
    const passwordHash = await bcrypt.hash(request.body.password, 12);
    await database.query(
      `INSERT INTO crm_users(role_id, full_name, email, password_hash, is_active, registration_status)
       SELECT id, $2, $3, $4, TRUE, 'approved' FROM crm_roles WHERE role_key = $1
       ON CONFLICT (email) DO NOTHING`,
      [request.body.role, request.body.fullName, request.body.email, passwordHash],
    );
    response.status(202).json({
      success: true,
      data: {},
      meta: {},
      message: 'Your account is ready. You can sign in now.',
    });
  } catch (error) { next(error); }
});

authRoutes.post('/login', loginLimiter, validateBody(loginSchema), async (request, response, next) => {
  try {
    const result = await database.query(
      `SELECT users.id, users.full_name, users.email, users.password_hash, users.is_active, users.registration_status, users.token_version,
        roles.role_key, COALESCE(array_agg(role_permissions.permission_key) FILTER (WHERE role_permissions.permission_key IS NOT NULL), '{}') AS permissions
       FROM crm_users users JOIN crm_roles roles ON roles.id = users.role_id
       LEFT JOIN crm_role_permissions role_permissions ON role_permissions.role_id = roles.id
       WHERE LOWER(users.email) = LOWER($1)
       GROUP BY users.id, roles.role_key`,
      [request.body.email],
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(request.body.password, user.password_hash))) {
      return response.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } });
    }
    if (!user.is_active) {
      if (user.registration_status === 'pending') {
        return response.status(403).json({ success: false, error: { code: 'REGISTRATION_PENDING', message: 'Your registration is awaiting Administrator approval.' } });
      }
      return response.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } });
    }
    const token = jwt.sign({ ver: user.token_version }, env.JWT_SECRET, {
      subject: String(user.id), issuer: 'velvorax-crm', audience: 'velvorax-crm-web', expiresIn: env.JWT_EXPIRES_IN,
    });
    return response.json({
      success: true,
      data: { token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role_key, permissions: user.permissions } },
      meta: {}, message: 'Signed in successfully',
    });
  } catch (error) { return next(error); }
});

authRoutes.get('/me', authenticate, (request, response) => {
  response.json({ success: true, data: request.user, meta: {}, message: 'Current user loaded' });
});

authRoutes.patch('/password', authenticate, validateBody(Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema.required(),
}).unknown(false)), async (request, response, next) => {
  try {
    const result = await database.query('SELECT password_hash FROM crm_users WHERE id = $1 AND is_active = TRUE', [request.user.id]);
    if (!result.rowCount || !(await bcrypt.compare(request.body.currentPassword, result.rows[0].password_hash))) {
      return response.status(400).json({ success: false, error: { code: 'PASSWORD_MISMATCH', message: 'Current password is incorrect.' } });
    }
    const passwordHash = await bcrypt.hash(request.body.newPassword, 12);
    await database.query('UPDATE crm_users SET password_hash = $1, token_version = token_version + 1, updated_at = NOW() WHERE id = $2', [passwordHash, request.user.id]);
    response.json({ success: true, data: {}, meta: {}, message: 'Password updated. Sign in again with your new password.' });
  } catch (error) { next(error); }
});

authRoutes.get('/roles', authenticate, requirePermission('users:read'), async (_request, response, next) => {
  try {
    const result = await database.query(
      `SELECT roles.role_key, roles.name,
        COALESCE(array_agg(role_permissions.permission_key) FILTER (WHERE role_permissions.permission_key IS NOT NULL), '{}') AS permissions
       FROM crm_roles roles LEFT JOIN crm_role_permissions role_permissions ON role_permissions.role_id = roles.id
       GROUP BY roles.id ORDER BY roles.id`,
    );
    response.json({ success: true, data: result.rows, meta: {}, message: 'Roles loaded' });
  } catch (error) { next(error); }
});

authRoutes.get('/users', authenticate, requirePermission('users:read'), async (_request, response, next) => {
  try {
    const result = await database.query(
      `SELECT users.id, users.full_name AS "fullName", users.email, users.is_active AS "isActive", users.registration_status AS "registrationStatus", users.created_at AS "createdAt", roles.role_key AS role
       FROM crm_users users JOIN crm_roles roles ON roles.id = users.role_id ORDER BY users.full_name`,
    );
    response.json({ success: true, data: result.rows, meta: {}, message: 'Users loaded' });
  } catch (error) { next(error); }
});

authRoutes.post('/users', authenticate, requirePermission('users:manage'), validateBody(createUserSchema), async (request, response, next) => {
  try {
    const role = await database.query('SELECT id FROM crm_roles WHERE role_key = $1', [request.body.role]);
    if (!role.rowCount) return response.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Select a valid role.' } });
    const passwordHash = await bcrypt.hash(request.body.password, 12);
    const user = await database.query(
      `INSERT INTO crm_users(role_id, full_name, email, password_hash)
       VALUES($1,$2,$3,$4) RETURNING id, full_name AS "fullName", email, is_active AS "isActive", registration_status AS "registrationStatus"`,
      [role.rows[0].id, request.body.fullName, request.body.email, passwordHash],
    );
    response.status(201).json({ success: true, data: { ...user.rows[0], role: request.body.role }, meta: {}, message: 'User created' });
  } catch (error) { next(error); }
});

const updateUserSchema = Joi.object({
  role: Joi.string().valid('admin', 'sales_manager', 'sales_rep', 'lead_researcher', 'marketing', 'telecaller'),
  isActive: Joi.boolean(),
}).min(1).unknown(false);

authRoutes.patch('/users/:id', authenticate, requirePermission('users:manage'), async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID must be a positive number.' } });
  const { error, value } = updateUserSchema.validate(request.body, { abortEarly: false, convert: true });
  if (error) return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide a valid role or active status.' } });
  if (id === request.user.id && value.isActive === false) return response.status(400).json({ success: false, error: { code: 'SELF_DISABLE', message: 'You cannot deactivate your own account.' } });

  try {
    const existing = await database.query(
      'SELECT users.is_active, roles.role_key FROM crm_users users JOIN crm_roles roles ON roles.id = users.role_id WHERE users.id = $1',
      [id],
    );
    if (!existing.rowCount) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    const losesAdminAccess = existing.rows[0].role_key === 'admin' && ((value.role && value.role !== 'admin') || value.isActive === false);
    if (losesAdminAccess) {
      const admins = await database.query(
        "SELECT COUNT(*)::int AS count FROM crm_users users JOIN crm_roles roles ON roles.id = users.role_id WHERE roles.role_key = 'admin' AND users.is_active = TRUE",
      );
      if (admins.rows[0].count <= 1) return response.status(409).json({ success: false, error: { code: 'LAST_ADMIN', message: 'The last active administrator cannot be demoted or deactivated.' } });
    }
    let roleId;
    if (value.role) {
      const role = await database.query('SELECT id FROM crm_roles WHERE role_key = $1', [value.role]);
      roleId = role.rows[0]?.id;
    }
    const result = await database.query(
      `UPDATE crm_users SET role_id = COALESCE($1, role_id), is_active = COALESCE($2, is_active),
         registration_status = CASE WHEN COALESCE($2, is_active) THEN 'approved' ELSE registration_status END,
         updated_at = NOW()
       WHERE id = $3 RETURNING id, full_name AS "fullName", email, is_active AS "isActive", registration_status AS "registrationStatus", role_id`,
      [roleId ?? null, value.isActive ?? null, id],
    );
    if (!result.rowCount) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    const currentRole = await database.query('SELECT role_key AS role FROM crm_roles WHERE id = $1', [result.rows[0].role_id]);
    const { role_id: _roleId, ...user } = result.rows[0];
    response.json({ success: true, data: { ...user, role: currentRole.rows[0].role }, meta: {}, message: 'User updated' });
  } catch (error) { next(error); }
});

module.exports = { authRoutes };
