"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.companySchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(2).max(180).required(),
    website: joi_1.default.string().trim().uri({ scheme: ['http', 'https'] }).allow('').default(''),
    industry: joi_1.default.string().trim().max(120).allow('').default(''),
    employeeCount: joi_1.default.number().integer().min(0).allow(null).default(null),
    country: joi_1.default.string().trim().max(100).allow('').default(''),
    city: joi_1.default.string().trim().max(100).allow('').default(''),
    status: joi_1.default.string().valid('Prospect', 'Customer', 'Inactive').default('Prospect'),
}).unknown(false);
