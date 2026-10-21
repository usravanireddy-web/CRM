"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const { recordRepository } = require('../../database/record-repository');
exports.taskService = recordRepository('tasks');
