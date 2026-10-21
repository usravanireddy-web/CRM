const { Router } = require('express');
const { requirePermission } = require('../../middleware/authorization');

const whatsappRoutes = Router();
whatsappRoutes.get('/status', requirePermission('whatsapp:read'), (_request, response) => {
  response.json({ success: true, data: { connected: false, provider: null, mode: 'manual', message: 'No WhatsApp provider is configured. Record follow-ups in CRM until an approved provider is connected.' }, meta: {}, message: 'WhatsApp status loaded' });
});
module.exports = { whatsappRoutes };
