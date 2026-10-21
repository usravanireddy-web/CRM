"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadService = void 0;
const { recordRepository } = require('../../database/record-repository');
exports.leadService = recordRepository('leads');
