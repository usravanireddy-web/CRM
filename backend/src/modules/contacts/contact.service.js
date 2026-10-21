"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactService = void 0;
const { recordRepository } = require('../../database/record-repository');
exports.contactService = recordRepository('contacts');
