const { Router } = require('express');
const Joi = require('joi');
const { database } = require('../../config/database');
const { requirePermission } = require('../../middleware/authorization');
const { validateBody, validateRecordId } = require('../../middleware/validate');
const { createTransport } = require('./email.routes');
const { env } = require('../../config/env');

const campaignRoutes = Router();
const campaignSchema = Joi.object({
  name: Joi.string().trim().min(2).max(140).required(),
  subject: Joi.string().trim().min(2).max(180).required(),
  body: Joi.string().trim().min(1).max(10000).required(),
  recipients: Joi.array().items(Joi.string().trim().email()).min(1).max(250).unique().required(),
}).unknown(false);

campaignRoutes.get('/', requirePermission('email_campaigns:read'), async (_request, response, next) => {
  try {
    const result = await database.query(
      `SELECT id, name, subject, jsonb_array_length(recipients) AS "recipientCount", status, created_at AS "createdAt", sent_at AS "sentAt"
       FROM crm_email_campaigns ORDER BY created_at DESC LIMIT 100`,
    );
    response.json({ success: true, data: result.rows, meta: {}, message: 'Campaigns loaded' });
  } catch (error) { next(error); }
});

campaignRoutes.post('/', requirePermission('email_campaigns:create'), validateBody(campaignSchema), async (request, response, next) => {
  try {
    const result = await database.query(
      `INSERT INTO crm_email_campaigns(name, subject, body_text, recipients, created_by_user_id)
       VALUES($1,$2,$3,$4::jsonb,$5) RETURNING id, name, subject, status, created_at AS "createdAt"`,
      [request.body.name, request.body.subject, request.body.body, JSON.stringify(request.body.recipients), request.user.id],
    );
    response.status(201).json({ success: true, data: result.rows[0], meta: {}, message: 'Campaign draft created' });
  } catch (error) { next(error); }
});

campaignRoutes.post('/:id/send', requirePermission('email_campaigns:send'), validateRecordId, async (request, response, next) => {
  const transport = createTransport();
  if (!transport) return response.status(503).json({ success: false, error: { code: 'SMTP_NOT_CONFIGURED', message: 'Email sending is unavailable until SMTP settings are added to backend/.env.' } });
  try {
    const claim = await database.query(
      `UPDATE crm_email_campaigns SET status = 'Sending' WHERE id = $1 AND status = 'Draft'
       RETURNING id, name, subject, body_text, recipients`,
      [request.params.id],
    );
    if (!claim.rowCount) return response.status(409).json({ success: false, error: { code: 'CAMPAIGN_UNAVAILABLE', message: 'This campaign was already sent or is currently sending.' } });
    const campaign = claim.rows[0];
    const recipients = campaign.recipients;
    try {
      await transport.sendMail({ from: env.SMTP_FROM || env.SMTP_USER, to: env.SMTP_FROM || env.SMTP_USER, bcc: recipients, subject: campaign.subject, text: campaign.body_text });
      await database.query("UPDATE crm_email_campaigns SET status = 'Sent', sent_at = NOW() WHERE id = $1", [campaign.id]);
      await database.query(
        "INSERT INTO crm_email_logs(campaign_id, sent_by_user_id, recipient, subject, status) SELECT $1,$2,recipient,$3,'Sent' FROM unnest($4::text[]) AS recipient",
        [campaign.id, request.user.id, campaign.subject, recipients],
      );
      response.status(202).json({ success: true, data: { id: campaign.id, status: 'Sent', recipientCount: recipients.length }, meta: {}, message: 'Campaign accepted by the configured SMTP server' });
    } catch (error) {
      await database.query("UPDATE crm_email_campaigns SET status = 'Draft' WHERE id = $1", [campaign.id]);
      await database.query(
        "INSERT INTO crm_email_logs(campaign_id, sent_by_user_id, recipient, subject, status) SELECT $1,$2,recipient,$3,'Failed' FROM unnest($4::text[]) AS recipient",
        [campaign.id, request.user.id, campaign.subject, recipients],
      );
      console.error('Campaign SMTP delivery failed:', error.code || 'unknown');
      next(error);
    }
  } catch (error) { next(error); }
});

module.exports = { campaignRoutes };
