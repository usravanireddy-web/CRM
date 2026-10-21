"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadController = void 0;
const crud_controller_1 = require("../shared/crud-controller");
const lead_service_1 = require("./lead.service");
exports.leadController = (0, crud_controller_1.createCrudController)(lead_service_1.leadService);
