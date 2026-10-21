"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const crud_controller_1 = require("../shared/crud-controller");
const company_service_1 = require("./company.service");
exports.companyController = (0, crud_controller_1.createCrudController)(company_service_1.companyService);
