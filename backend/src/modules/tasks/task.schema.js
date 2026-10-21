"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.taskSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(2).max(180).required(),
    description: joi_1.default.string().trim().max(2000).allow('').default(''),
    relatedTo: joi_1.default.string().trim().max(180).allow('').default(''),
    dueAt: joi_1.default.date().iso().allow(null, '').default(null),
    priority: joi_1.default.string().valid('Low', 'Normal', 'High', 'Urgent').default('Normal'),
    status: joi_1.default.string().valid('Open', 'In progress', 'Completed', 'Cancelled').default('Open'),
    assignee: joi_1.default.string().trim().max(120).allow('').default(''),
}).unknown(false);
