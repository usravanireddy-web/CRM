const { Router } = require('express');
const { requirePermission } = require('../../middleware/authorization');
const settingsRoutes = Router();

settingsRoutes.get('/', requirePermission('settings:read'), (_request, response) => {
  response.json({ success: true, data: {
    leadStatuses: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
    dealStages: ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    taskPriorities: ['Low', 'Normal', 'High', 'Urgent'],
    storageMode: 'postgresql',
  }, meta: {}, message: 'Workspace settings loaded' });
});

module.exports = { settingsRoutes };
