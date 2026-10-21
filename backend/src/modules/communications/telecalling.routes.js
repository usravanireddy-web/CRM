const { Router } = require('express');
const Joi = require('joi');
const { database } = require('../../config/database');
const { requirePermission } = require('../../middleware/authorization');
const { validateBody } = require('../../middleware/validate');

const telecallingRoutes = Router();
const callSchema = Joi.object({
  contactName: Joi.string().trim().min(2).max(160).required(),
  phone: Joi.string().trim().pattern(/^[+0-9().\-\s]{7,40}$/).required(),
  outcome: Joi.string().valid('Connected', 'No answer', 'Voicemail', 'Callback requested', 'Meeting booked').required(),
  notes: Joi.string().trim().max(2000).allow('').default(''),
}).unknown(false);

telecallingRoutes.get('/logs', requirePermission('telecalling:read'), async (request, response, next) => {
  try {
    const scoped = ['sales_rep', 'telecaller'].includes(request.user.role);
    const result = await database.query(
      `SELECT id, contact_name AS "contactName", phone, outcome, notes, created_at AS "createdAt"
       FROM crm_call_logs ${scoped ? 'WHERE user_id = $1' : ''} ORDER BY created_at DESC LIMIT 100`,
      scoped ? [request.user.id] : [],
    );
    response.json({ success: true, data: result.rows, meta: {}, message: 'Call activity loaded' });
  } catch (error) { next(error); }
});

telecallingRoutes.post('/logs', requirePermission('telecalling:create'), validateBody(callSchema), async (request, response, next) => {
  try {
    const result = await database.query(
      `INSERT INTO crm_call_logs(user_id, contact_name, phone, outcome, notes)
       VALUES($1,$2,$3,$4,$5) RETURNING id, contact_name AS "contactName", phone, outcome, notes, created_at AS "createdAt"`,
      [request.user.id, request.body.contactName, request.body.phone, request.body.outcome, request.body.notes || null],
    );
    response.status(201).json({ success: true, data: result.rows[0], meta: {}, message: 'Call activity saved' });
  } catch (error) { next(error); }
});

module.exports = { telecallingRoutes };
