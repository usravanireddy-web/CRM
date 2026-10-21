"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealService = void 0;
const { recordRepository } = require('../../database/record-repository');
exports.dealService = recordRepository('deals');
