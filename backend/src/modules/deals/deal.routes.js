"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealRoutes = void 0;
const crud_routes_1 = require("../shared/crud-routes");
const deal_controller_1 = require("./deal.controller");
const deal_validation_1 = require("./deal.validation");
exports.dealRoutes = (0, crud_routes_1.createCrudRoutes)(deal_controller_1.dealController, deal_validation_1.createDealSchema, 'deals');
