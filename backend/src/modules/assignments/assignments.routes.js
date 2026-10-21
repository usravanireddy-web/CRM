const { Router } = require('express');
const Joi = require('joi');
const { database } = require('../../config/database');
const { requirePermission } = require('../../middleware/authorization');
const { validateBody, validateRecordId } = require('../../middleware/validate');

const assignmentsRoutes = Router();
const assignSchema = Joi.object({ userId: Joi.number().integer().positive().allow(null, '').required() }).unknown(false);
const resources = {
  leads: { table: 'crm_leads', column: 'owner_user_id', label: `first_name || ' ' || COALESCE(last_name, '')` },
  deals: { table: 'crm_deals', column: 'owner_user_id', label: 'name' },
  tasks: { table: 'crm_tasks', column: 'assignee_user_id', label: 'title' },
};

assignmentsRoutes.use(requirePermission('assignments:manage'));

assignmentsRoutes.get('/', async (_request, response, next) => {
  try {
    const [users, leads, deals, tasks] = await Promise.all([
      database.query('SELECT id, full_name AS "fullName", email FROM crm_users WHERE is_active = TRUE ORDER BY full_name'),
      database.query(`SELECT id, (${resources.leads.label}) AS label, company, owner_user_id AS "userId" FROM ${resources.leads.table} ORDER BY created_at DESC LIMIT 500`),
      database.query(`SELECT id, ${resources.deals.label} AS label, company, owner_user_id AS "userId" FROM ${resources.deals.table} ORDER BY created_at DESC LIMIT 500`),
      database.query(`SELECT id, ${resources.tasks.label} AS label, status, assignee_user_id AS "userId" FROM ${resources.tasks.table} ORDER BY created_at DESC LIMIT 500`),
    ]);
    response.json({ success: true, data: { users: users.rows, leads: leads.rows, deals: deals.rows, tasks: tasks.rows }, meta: {}, message: 'Team assignments loaded' });
  } catch (error) { next(error); }
});

assignmentsRoutes.patch('/:resource/:id', validateRecordId, validateBody(assignSchema), async (request, response, next) => {
  const resource = resources[request.params.resource];
  if (!resource) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assignment type not found.' } });
  try {
    const userId = request.body.userId === '' ? null : request.body.userId;
    if (userId !== null) {
      const user = await database.query('SELECT id FROM crm_users WHERE id = $1 AND is_active = TRUE', [userId]);
      if (!user.rowCount) return response.status(400).json({ success: false, error: { code: 'INVALID_USER', message: 'Select an active team member.' } });
    }
    const result = await database.query(`UPDATE ${resource.table} SET ${resource.column} = $1, updated_at = NOW() WHERE id = $2 RETURNING id`, [userId, request.params.id]);
    if (!result.rowCount) return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found.' } });
    response.json({ success: true, data: { id: result.rows[0].id, userId }, meta: {}, message: 'Assignment updated' });
  } catch (error) { next(error); }
});

module.exports = { assignmentsRoutes };
