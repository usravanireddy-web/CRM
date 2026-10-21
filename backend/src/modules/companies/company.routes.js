"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRoutes = void 0;
const crud_routes_1 = require("../shared/crud-routes");
const company_controller_1 = require("./company.controller");
const company_validation_1 = require("./company.validation");
exports.companyRoutes = (0, crud_routes_1.createCrudRoutes)(company_controller_1.companyController, company_validation_1.createCompanySchema, 'companies');
