const { Router } = require('express');
const { database } = require('../../config/database');
const { requirePermission } = require('../../middleware/authorization');
const reportsRoutes = Router();

reportsRoutes.get('/summary', requirePermission('dashboard:read'), async (request, response, next) => {
  try {
    const scoped = ['sales_rep', 'telecaller', 'lead_researcher'].includes(request.user.role);
    const permissions = new Set(request.user.permissions);
    const canRead = (resource) => permissions.has(`${resource}:read`);
    const leadFilter = scoped ? 'WHERE owner_user_id = $1' : '';
    const dealFilter = scoped ? 'WHERE owner_user_id = $1' : '';
    const taskFilter = scoped ? 'WHERE assignee_user_id = $1' : '';
    const ownerParams = scoped ? [request.user.id] : [];
    const [leads, deals, tasks, statuses, sources, companies] = await Promise.all([
      canRead('leads') ? database.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'Qualified')::int AS qualified FROM crm_leads ${leadFilter}`, ownerParams) : null,
      canRead('deals') ? database.query(`SELECT COUNT(*) FILTER (WHERE stage NOT IN ('Won', 'Lost'))::int AS open, COUNT(*) FILTER (WHERE stage = 'Won')::int AS won FROM crm_deals ${dealFilter}`, ownerParams) : null,
      canRead('tasks') ? database.query(`SELECT COUNT(*) FILTER (WHERE status NOT IN ('Completed', 'Cancelled'))::int AS open FROM crm_tasks ${taskFilter}`, ownerParams) : null,
      canRead('leads') ? database.query(`SELECT status, COUNT(*)::int AS count FROM crm_leads ${leadFilter} GROUP BY status ORDER BY status`, ownerParams) : null,
      canRead('leads') ? database.query(`SELECT source, COUNT(*)::int AS count FROM crm_leads ${leadFilter} GROUP BY source ORDER BY count DESC, source LIMIT 7`, ownerParams) : null,
      canRead('companies') ? database.query('SELECT COUNT(*)::int AS total FROM crm_companies') : null,
    ]);
    response.json({ success: true, data: {
      totalLeads: leads?.rows[0].total ?? null,
      qualifiedLeads: leads?.rows[0].qualified ?? null,
      openDeals: deals?.rows[0].open ?? null,
      wonDeals: deals?.rows[0].won ?? null,
      openTasks: tasks?.rows[0].open ?? null,
      totalCompanies: companies?.rows[0].total ?? null,
      byLeadStatus: statuses?.rows ?? [],
      byLeadSource: sources?.rows ?? [],
    }, meta: {}, message: 'Summary calculated from data available to the signed-in role' });
  } catch (error) { next(error); }
});

module.exports = { reportsRoutes };
