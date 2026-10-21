"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadIntelligenceRoutes = void 0;
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validate_1 = require("../../middleware/validate");
const { requirePermission } = require("../../middleware/authorization");
exports.leadIntelligenceRoutes = (0, express_1.Router)();
exports.leadIntelligenceRoutes.get('/status', requirePermission('lead_intelligence:read'), (_request, response) => {
    response.json({ success: true, data: { mode: 'manual', providerConnected: false, message: 'No discovery provider is configured. Add prospects manually or configure an approved provider later.' }, meta: {}, message: 'Lead Intelligence status loaded' });
});
exports.leadIntelligenceRoutes.post('/search', requirePermission('lead_intelligence:create'), (0, validate_1.validateBody)(joi_1.default.object({
    country: joi_1.default.string().trim().max(100).allow('').default(''),
    city: joi_1.default.string().trim().max(100).allow('').default(''),
    industry: joi_1.default.string().trim().max(120).allow('').default(''),
    companySize: joi_1.default.string().valid('', '1-10', '11-50', '51-200', '201-500', '501+').default(''),
}).unknown(false)), (_request, response) => {
    response.status(409).json({ success: false, error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'Company discovery is unavailable until an approved provider is configured. No prospect data was generated.' } });
});
