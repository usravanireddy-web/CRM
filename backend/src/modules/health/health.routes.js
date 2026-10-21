"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.healthRoutes = (0, express_1.Router)();
exports.healthRoutes.get('/', async (_request, response, next) => {
    try {
        await database_1.database.query('SELECT 1');
        response.json({ success: true, data: { status: 'ok', database: 'connected' }, meta: {}, message: 'Service is healthy' });
    }
    catch (error) {
        next(error);
    }
});
