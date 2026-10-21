"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.leadSchema = joi_1.default.object({
    firstName: joi_1.default.string().trim().max(80).required(),
    lastName: joi_1.default.string().trim().max(80).allow('').default(''),
    company: joi_1.default.string().trim().max(160).allow('').default(''),
    email: joi_1.default.string().trim().email().allow('').default(''),
    phone: joi_1.default.string().trim().max(40).allow('').default(''),
    source: joi_1.default.string().valid('Website', 'Referral', 'LinkedIn', 'Campaign', 'Other').default('Other'),
    status: joi_1.default.string().valid('New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost').default('New'),
    owner: joi_1.default.string().trim().max(120).allow('').default(''),
    nextFollowUp: joi_1.default.date().iso().allow(null, '').default(null),
}).unknown(false);
