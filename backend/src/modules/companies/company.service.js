"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const { recordRepository } = require('../../database/record-repository');
exports.companyService = recordRepository('companies');
