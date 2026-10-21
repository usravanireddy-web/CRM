const { Router } = require('express');
const { database } = require('../../config/database');
const { requirePermission } = require('../../middleware/authorization');

const marketingRoutes = Router();
marketingRoutes.get('/summary', requirePermission('marketing:read'), async (_request, response, next) => {
  try {
    const [campaigns, leads] = await Promise.all([
      database.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'Sent')::int AS sent FROM crm_email_campaigns"),
      database.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE source = 'Campaign')::int AS campaign_leads FROM crm_leads"),
    ]);
    response.json({ success: true, data: { campaigns: campaigns.rows[0].total, sentCampaigns: campaigns.rows[0].sent, leads: leads.rows[0].total, campaignLeads: leads.rows[0].campaign_leads }, meta: {}, message: 'Marketing totals loaded' });
  } catch (error) { next(error); }
});
module.exports = { marketingRoutes };
