"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const crud_controller_1 = require("../shared/crud-controller");
const task_service_1 = require("./task.service");
exports.taskController = (0, crud_controller_1.createCrudController)(task_service_1.taskService);
