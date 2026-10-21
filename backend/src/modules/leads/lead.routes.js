"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRoutes = void 0;
const crud_routes_1 = require("../shared/crud-routes");
const lead_controller_1 = require("./lead.controller");
const lead_validation_1 = require("./lead.validation");
exports.leadRoutes = (0, crud_routes_1.createCrudRoutes)(lead_controller_1.leadController, lead_validation_1.createLeadSchema, 'leads');
