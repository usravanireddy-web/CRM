"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.contactSchema = joi_1.default.object({
    firstName: joi_1.default.string().trim().min(1).max(80).required(),
    lastName: joi_1.default.string().trim().max(80).allow('').default(''),
    email: joi_1.default.string().trim().email().allow('').default(''),
    phone: joi_1.default.string().trim().max(40).allow('').default(''),
    company: joi_1.default.string().trim().max(180).allow('').default(''),
    title: joi_1.default.string().trim().max(120).allow('').default(''),
    status: joi_1.default.string().valid('Unverified', 'Verified', 'Do not contact').default('Unverified'),
}).unknown(false);
