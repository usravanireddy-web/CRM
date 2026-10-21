"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutes = void 0;
const crud_routes_1 = require("../shared/crud-routes");
const task_controller_1 = require("./task.controller");
const task_validation_1 = require("./task.validation");
exports.taskRoutes = (0, crud_routes_1.createCrudRoutes)(task_controller_1.taskController, task_validation_1.createTaskSchema, 'tasks');
