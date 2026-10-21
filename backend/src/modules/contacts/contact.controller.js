"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactController = void 0;
const crud_controller_1 = require("../shared/crud-controller");
const contact_service_1 = require("./contact.service");
exports.contactController = (0, crud_controller_1.createCrudController)(contact_service_1.contactService);
