const Joi = require('joi');

const dealSchema = Joi.object({
  name: Joi.string().trim().min(2).max(180).required(),
  company: Joi.string().trim().max(180).allow('').default(''),
  leadId: Joi.number().integer().positive().allow(null, '').default(null),
  stage: Joi.string().valid('Qualification', 'Demo', 'Proposal', 'Negotiation', 'Won', 'Lost').default('Qualification'),
  amount: Joi.number().min(0).allow(null).default(null),
  currency: Joi.string().length(3).uppercase().default('USD'),
  expectedCloseDate: Joi.date().iso().allow(null, '').default(null),
  owner: Joi.string().trim().max(120).allow('').default(''),
}).unknown(false);

module.exports = { dealSchema };
