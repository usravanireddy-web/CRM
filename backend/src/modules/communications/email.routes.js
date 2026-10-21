const { Router } = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const { database } = require('../../config/database');
const { env } = require('../../config/env');
const { requirePermission } = require('../../middleware/authorization');
const { validateBody, validateRecordId } = require('../../middleware/validate');

const emailRoutes = Router();
const sendSchema = Joi.object({
  to: Joi.string().trim().email().required(),
  subject: Joi.string().trim().min(2).max(180).required(),
  text: Joi.string().trim().min(1).max(10000).required(),
}).unknown(false);

function createTransport() {
  if (!env.SMTP_HOST || !(env.SMTP_FROM || env.SMTP_USER)) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
  });
}

emailRoutes.get('/status', requirePermission('email:read'), (_request, response) => {
  response.json({ success: true, data: { configured: Boolean(createTransport()), provider: 'SMTP' }, meta: {}, message: 'Email configuration status loaded' });
});

emailRoutes.get('/logs', requirePermission('email:read'), async (request, response, next) => {
  try {
    const scoped = ['sales_rep', 'telecaller'].includes(request.user.role);
    const result = await database.query(
      `SELECT id, recipient, subject, status, created_at AS "createdAt" FROM crm_email_logs
       ${scoped ? 'WHERE sent_by_user_id = $1' : ''} ORDER BY created_at DESC LIMIT 100`,
      scoped ? [request.user.id] : [],
    );
    response.json({ success: true, data: result.rows, meta: {}, message: 'Email activity loaded' });
  } catch (error) { next(error); }
});

emailRoutes.post('/send', requirePermission('email:send'), validateBody(sendSchema), async (request, response, next) => {
  const transport = createTransport();
  if (!transport) return response.status(503).json({ success: false, error: { code: 'SMTP_NOT_CONFIGURED', message: 'Email sending is unavailable until SMTP settings are added to backend/.env.' } });
  try {
    const result = await transport.sendMail({ from: env.SMTP_FROM || env.SMTP_USER, to: request.body.to, subject: request.body.subject, text: request.body.text });
    await database.query(
      "INSERT INTO crm_email_logs(sent_by_user_id, recipient, subject, status) VALUES($1,$2,$3,'Sent')",
      [request.user.id, request.body.to, request.body.subject],
    );
    response.status(202).json({ success: true, data: { accepted: result.accepted.length }, meta: {}, message: 'Email accepted by the configured SMTP server' });
  } catch (error) {
    console.error('SMTP delivery failed:', error.code || 'unknown');
    next(error);
  }
});

module.exports = { emailRoutes, createTransport };
