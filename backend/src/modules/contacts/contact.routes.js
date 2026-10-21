"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRoutes = void 0;
const crud_routes_1 = require("../shared/crud-routes");
const contact_controller_1 = require("./contact.controller");
const contact_validation_1 = require("./contact.validation");
exports.contactRoutes = (0, crud_routes_1.createCrudRoutes)(contact_controller_1.contactController, contact_validation_1.createContactSchema, 'contacts');
