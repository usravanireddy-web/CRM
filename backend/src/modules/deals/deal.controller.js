"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealController = void 0;
const crud_controller_1 = require("../shared/crud-controller");
const deal_service_1 = require("./deal.service");
exports.dealController = (0, crud_controller_1.createCrudController)(deal_service_1.dealService);
